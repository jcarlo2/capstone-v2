import {useContext, useEffect, useRef, useState} from "react";
import {add, fixNumber, setNavDisplay} from "../../helper/GlobalHelper";
import Layout from "../../components/Layout/inventory/Layout";
import {InventoryReportList} from "../../components/InventoryReportList";
import {GlobalContext} from "../../context/GlobalContext";

export default function History() {
    const ip = useContext(GlobalContext).ip
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const id = useContext(GlobalContext).inventoryHistoryReportId
    const setId = useContext(GlobalContext).setInventoryHistoryReportId
    const lossTable = useRef()
    const goodsTable = useRef()
    const invalidate = useRef()
    const [itemList, setItemList] = useState([])
    const [report, setReport] = useState({
        id: '',
        user: '',
        timestamp: '',
    })

    useEffect(()=> setNavDisplay(true),[])

    useEffect(()=> {
        if(id !== '') {
            let str = 'loss'
            if(id.charAt(0) === 'I') str = 'goods'
            fetch(`${ip}/${str}/find-all-items?id=${id}`)
                .then(res=> {return res.json()})
                .then(setItemList)
            fetch(`${ip}/${str}/find-report?id=${id}`)
                .then(res=> {return res.json()})
                .then(setReport)
        }else {
            setReport({
                id: '',
                user: '',
                timestamp: '',
            })
            setItemList([])
        }
    },[id])

    const handleDiscredit = ()=> {
        ipcRenderer.invoke('open-dialog-box', {
            type: 'none',
            buttons: ['Invalidate', 'Cancel'],
            message: `Do you want to invalidate report ${id}?`,
            noLink: true,
            title: 'Invalidate',
            defaultId: 0
        }).then(num=> {
               if(num === 0 && id !== '') {
                   let str = 'loss'
                   if(id.charAt(0) === 'I') str = 'goods'
                   fetch(`${ip}/${str}/invalidate?id=${id}`)
                       .then(res => {return res.json()})
                       .then(hasFinished => {
                           if(hasFinished) {
                               ipcRenderer.send('showMessage',`Invalidate: ${id}`, 'Success...')
                               setId('')
                           } else if(str === 'goods') ipcRenderer.send('showError','Invalidate',
                               'Cannot invalidate the report if one of the products has been used in a transaction and its quantity has been deducted.')
                           else ipcRenderer.send('showError', 'Invalidate', 'Try Again...')
                       })
               }else if(id === '') ipcRenderer.send('showError','Invalidate','Choose a report first.')
           })
    }

    return (
        <div className={'default-container'}>
            <div className="left">
                <InventoryReportList lossTable={lossTable} goodsTable={goodsTable} invalidate={invalidate} />
            </div>
            <div className="right">
                    <div className="inventory-history-right">
                        <div>
                            <div>
                                <input value={report.id} type="text" readOnly={true} placeholder={'Id'}/>
                                <input value={report.user} type="text" readOnly={true} placeholder={'User'}/>
                                <input value={report.timestamp} type="text" readOnly={true} placeholder={'Timestamp'}/>
                            </div>
                            <input ref={invalidate} type="button" className={'btn'} defaultValue={'Discredit'}
                                onClick={handleDiscredit}
                            />
                        </div>
                        <div>
                            <table ref={lossTable} className={'product-table'}>
                                <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Description</th>
                                    <th title={'Quantity'}>Qty</th>
                                </tr>
                                </thead>
                                <tbody>
                                    {
                                        itemList.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.id}</td>
                                                <td>{item.description}</td>
                                                <td>{item.quantity.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                            <table style={{display: "none"}} ref={goodsTable} className={'product-table goods-table'}>
                                <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Description</th>
                                    <th>Price</th>
                                    <th>Qty</th>
                                    <th>Expiration</th>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    itemList.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td>{item.description}</td>
                                            <td>&#8369; {fixNumber(add(item.price,item.markPrice))}</td>
                                            <td>{item.quantity.toLocaleString()}</td>
                                            <td>{item.expiration && item.expiration.split(' ')[0]}</td>
                                        </tr>
                                    ))
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
            </div>
        </div>
    )
}

History.Layout = Layout