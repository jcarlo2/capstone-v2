import {useContext, useEffect, useRef, useState} from "react";
import {dropdownClickHandler, fixNumber, setNavDisplay, toggleDropdownList} from "../../helper/GlobalHelper";
import {GlobalContext} from "../../context/GlobalContext";
import {useReportHelper} from "../../helper/ReportHelper";

export default function Generate() {
    const ip = useContext(GlobalContext).ip
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const {username} = useContext(GlobalContext).user
    const [maxDate, setMaxDate] = useState('')
    const [start, setStart] = useState('')
    const salesTable = useRef()
    const lossTable = useRef()
    const goodsTable = useRef()
    const optionList = useRef()
    const dateInput = useRef()
    const dropContainer = useRef()
    const yearHolder = useRef()
    const [yearList, setYearList] = useState([])
    const [activeTab, setActiveTab] = useState('SALES')
    const [salesList, setSalesList] = useState([])
    const [lossList, setLossList] = useState([])
    const [goodsList, setGoodsList] = useState([])
    const [salesInfo, setSalesInfo] = useState({
        total: 0,
        transaction: 0,
        quantity: 0,
    })
    const [lossInfo, setLossInfo] = useState({
        expired: 0,
        damaged: 0,
        quantity: 0,
    })
    const [goodsInfo, setGoodsInfo] = useState({
        product: 0,
        quantity: 0,
    })
    const [option, setOption] = useState('Daily')
    const [breakDown, setBreakdown] = useState([])
    const [dateNow, setDateNow] = useState('2015-01-01 00:00:00')
    const [dateAsOf, setDateAsOf] = useState('2015-01-01')
    const helper = useReportHelper()

    useEffect(()=> {
        setNavDisplay(true)
        init()
        document.addEventListener('click',dropdownClickHandler)
        return ()=> document.removeEventListener('click',dropdownClickHandler)
    },[])

    useEffect(()=> {
        setStart('')
        if(option === 'Daily') dateInput.current.type = 'date'
        else if(option === 'Weekly') dateInput.current.type = 'week'
        else if(option === 'Monthly') dateInput.current.type = 'month'
        dropContainer.current.style.display = option === 'Annual' ? 'flex' : 'none'
        dateInput.current.style.display = option === 'Annual' ? 'none' : 'inline-flex'
    },[option])

    useEffect(()=> {
        salesTable.current.style.display = 'none'
        lossTable.current.style.display = 'none'
        goodsTable.current.style.display = 'none'
        if(activeTab === 'SALES') {
            handleSalesSummary()
            salesTable.current.style.display = 'table'
        } else if(activeTab === 'LOSS') {
            handleLossSummary()
            lossTable.current.style.display = 'table'
        } else {
            handleGoodsSummary()
            goodsTable.current.style.display = 'table'
        }
    },[activeTab,salesList,lossList,goodsList])

    const init = ()=> {
        Promise.all([
            fetch(`${ip}/date/get-date-ahead`).then(res => res.json()),
            fetch(`${ip}/date/get-date`).then(res => res.text()),
        ]).then(([yearList,date])=> {
            setYearList(yearList)
            setMaxDate(date.split(' ')[0])
            setDateNow(date)
        })
    }

    const handleSalesSummary = ()=> {
        const totalSales = salesList.map(item => item.total).reduce((acc,curr)=> acc + curr ,0)
        const totalQuantity = salesList.map(item => item.quantity).reduce((acc,curr)=> acc + curr ,0)
        setSalesInfo(prevState => ({
            ...prevState,
            total: totalSales,
            quantity: totalQuantity
        }))
    }

    const handleLossSummary = ()=> {
        const reason = lossList.map(item => {
            return {
                reason: item.reason,
                quantity: item.quantity
            }
        }).reduce((acc,curr)=> {
          if(curr.reason === 'Damaged') acc.damaged += curr.quantity
          else acc.expired += curr.quantity
            return acc
        },{expired: 0, damaged: 0})
        const totalQuantity = lossList.map(item => item.quantity).reduce((acc,curr)=> acc + curr ,0)
        setLossInfo({
            expired: reason.expired,
            damaged: reason.damaged,
            quantity: totalQuantity
        })
    }

    const handleGoodsSummary = ()=> {
        const product = goodsList.reduce((acc,curr)=> {
            if (!acc.has(curr.id)) {
                acc.add(curr.id);
            }
            return acc;
        },new Set())
        const totalQuantity = goodsList.map(item => item.quantity).reduce((arr,curr)=> arr + curr,0)
        setGoodsInfo({
            product: product.size,
            quantity: totalQuantity
        })
    }

    const handleGenerate = ()=> {
        let startValue = start
        if(start === '') return
        if(start.length !== 4 && option === 'Annual') startValue = start.split('-')[0]
        Promise.all([
            fetch(`${ip}/report/sales-product-report?start=${startValue}&option=${option}`).then(res => res.json()),
            fetch(`${ip}/report/loss-product-report?start=${startValue}&option=${option}`).then(res => res.json()),
            fetch(`${ip}/report/goods-product-report?start=${startValue}&option=${option}`).then(res => res.json()),
            fetch(`${ip}/transaction/count-report?start=${startValue}&option=${option}`).then(res => res.json()),
            fetch(`${ip}/date/get-date`).then(res => res.text()),
            fetch(`${ip}/date/get-date-asOf?start=${start}&option=${option}`).then(res => res.text()),
            (option === 'Annual' && fetch(`${ip}/transaction/get-annual-break?start=${start}&option=${option}`).then(res => res.json()))
        ]).then(([
            sales,loss,goods,salesCount,dateNow,dateAsOf,breakDown])=> {
            setSalesList(sales)
            setLossList(loss)
            setGoodsList(goods)
            setSalesInfo(prevState => ({
                ...prevState,
                transaction: salesCount
            }))
            setDateNow(dateNow)
            setDateAsOf(dateAsOf)
            setBreakdown(breakDown)
        })
    }

    const handleExport = ()=> {
        ipcRenderer.send('documentPath')
        ipcRenderer.removeAllListeners('documentPath')
        ipcRenderer.on('documentPath',(e,path)=> {
            ipcRenderer.invoke('open-dialog-box', {
                type: 'none',
                buttons: ['Confirm', 'Cancel'],
                message: 'Confirm to export the report.',
                noLink: true,
                title: 'Export',
                defaultId: 0
            }).then(num => {
                console.log(dateNow)
                if(num === 0) helper.make(salesList,lossList,goodsList,dateNow,dateAsOf,option,path,username,breakDown,salesInfo.transaction)
            })
        })
    }

    return (
        <div className={'generate-container'}>
            <div className="left">
                <div>
                    <input ref={dateInput} type="date" onChange={(e)=> setStart(e.currentTarget.value)} max={maxDate}/>
                    <div ref={dropContainer} className={'year-picker dropdown'} style={{display:"none"}}>
                        <input readOnly={true} type="text" className={'dropdown-btn'}
                           value={start.split('-')[0]}
                            onClick={()=> toggleDropdownList(yearHolder.current)}
                        />
                        <ul ref={yearHolder} className={'dropdown-list'}>
                            {
                                yearList.map(year => (
                                    <li onClick={()=> setStart(year.toString())} key={year}>{year}</li>
                                ))
                            }
                        </ul>
                    </div>
                    <div className="dropdown">
                        <input type="button" className={'btn dropdown-btn'} value={option}
                            onClick={()=> toggleDropdownList(optionList.current)}
                        />
                        <ul ref={optionList} className={'dropdown-list'}>
                            <li onClick={()=> setOption('Daily')}>Daily</li>
                            <li onClick={()=> setOption('Weekly')}>Weekly</li>
                            <li onClick={()=> setOption('Monthly')}>Monthly</li>
                            <li onClick={()=> setOption('Annual')}>Annual</li>
                        </ul>
                    </div>
                    <input type="button" className={'btn'} defaultValue={'Generate'} onClick={handleGenerate}/>
                </div>
                <div>
                    <div>
                        <input type="button" className={'btn'} defaultValue={'Sales'} onClick={()=> setActiveTab('SALES')}/>
                        <input type="button" className={'btn'} defaultValue={'Inventory Loss'} onClick={()=> setActiveTab('LOSS')}/>
                        <input type="button" className={'btn'} defaultValue={'Goods Receipt'} onClick={()=> setActiveTab('GOODS')}/>
                    </div>
                    <div>
                        <div>
                            <h1>{activeTab === 'SALES'
                                ? 'Sales'
                                : activeTab === 'LOSS'
                                    ? 'Inventory Loss'
                                    : 'Goods Receipt'}</h1>
                        </div>
                        <div>
                            <div>
                                <h3 className={activeTab === 'SALES' ? 'sales'
                                    : activeTab === 'LOSS'
                                        ? 'loss'
                                        : 'goods'
                                }>
                                    {activeTab === 'SALES' ? 'Total Sales' : activeTab === 'LOSS' ? 'Expired' : 'Product '}
                                </h3>
                                <input type="text" readOnly={true}
                                    value={activeTab === 'SALES'
                                        ? `\u20B1 ${fixNumber(salesInfo.total)}`
                                        : activeTab === 'LOSS'
                                            ? lossInfo.damaged.toLocaleString()
                                            : goodsInfo.product .toLocaleString()}
                                />
                            </div>
                            <div>
                                <h3 className={activeTab === 'SALES' ? 'sales'
                                    : activeTab === 'LOSS'
                                        ? 'loss'
                                        : 'goods'
                                }>
                                    {activeTab === 'SALES' ? 'Transaction' : activeTab === 'LOSS' ? 'Damaged' : 'Quantity '}
                                </h3>
                                <input type="text" readOnly={true}
                                       value={activeTab === 'SALES'
                                           ? salesInfo.transaction.toLocaleString()
                                           : activeTab === 'LOSS'
                                               ? lossInfo.expired.toLocaleString()
                                               : goodsInfo.quantity.toLocaleString()}
                                />
                            </div>
                            <div style={{display: activeTab === 'GOODS' ? 'none' : 'flex'}}>
                                <h3 className={activeTab === 'SALES' ? 'sales'
                                    : activeTab === 'LOSS'
                                        ? 'loss'
                                        : 'goods'
                                }>
                                    Quantity
                                </h3>
                                <input type="text" readOnly={true}
                                       value={activeTab === 'SALES'
                                           ? salesInfo.quantity.toLocaleString()
                                           : lossInfo.quantity.toLocaleString()}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <input type="button" className={'btn'} defaultValue={'Export'} onClick={handleExport}/>
                    </div>
                </div>
            </div>
            <div className="right">
                <table ref={salesTable} className="product-table sales-report-table">
                    <thead>
                    <tr>
                        <th>Id</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Disc</th>
                        <th>Total Sales</th>
                    </tr>
                    </thead>
                    <tbody>
                        {
                            salesList.map(item => (
                                <tr key={`${item.id}${item.price}${item.quantity}${item.total}${item.name}`}>
                                    <td>{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>{`\u20B1 ${fixNumber(item.price)}`}</td>
                                    <td>{item.quantity.toLocaleString()}</td>
                                    <td>{item.discount.toLocaleString()} %</td>
                                    <td>{`\u20B1 ${fixNumber(item.total)}`}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                <table ref={lossTable} style={{display: "none"}} className="product-table loss-report-table">
                    <thead>
                    <tr>
                        <th>Id</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Reason</th>
                    </tr>
                    </thead>
                    <tbody>
                        {
                            lossList.map(item => (
                                <tr key={`${item.id}${item.price}${item.quantity}${item.total}${item.name}`}>
                                    <td>{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.quantity.toLocaleString()}</td>
                                    <td>{item.reason}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                <table ref={goodsTable} style={{display: "none"}} className="product-table goods-report-table">
                    <thead>
                    <tr>
                        <th>Id</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Price</th>
                    </tr>
                    </thead>
                    <tbody>
                        {
                            lossList.map(item => (
                                <tr key={`${item.id}${item.price}${item.quantity}${item.total}${item.name}`}>
                                    <td>{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.quantity.toLocaleString()}</td>
                                    <td>{`\u20B1 ${fixNumber(item.price)}`}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}