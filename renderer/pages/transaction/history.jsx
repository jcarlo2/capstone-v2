import Layout from "../../components/Layout/transaction/Layout";
import {TransactionReportList} from "../../components/TransactionReportList";
import {fixNumber, setNavDisplay} from "../../helper/GlobalHelper";
import {useContext, useEffect, useRef, useState} from "react";
import {GlobalContext} from "../../context/GlobalContext";

export default function History() {
    const ip = useContext(GlobalContext).ip
    const historyId = useContext(GlobalContext).transactionHistoryReportId
    const [itemList, setItemList] = useState([])
    const id = useRef()
    const user = useRef()
    const total = useRef()
    const timestamp = useRef()
    const [report, setReport] = useState({
        id: '',
        user: '',
        totalAmount: 0,
        timestamp: '',
    })

    useEffect(()=> setNavDisplay(true),[])

    useEffect(()=> {
        id.current.value = report.id
        user.current.value = report.user
        total.current.value = `\u20B1 ${fixNumber(report.totalAmount)}`
        timestamp.current.value = report.timestamp
    },[report])

    useEffect(()=> {
        findAllItemsOfReportId()
    },[historyId])

    const findAllItemsOfReportId = ()=> {
        if(historyId === '') return
        fetch(`${ip}/transaction/find-items?id=${historyId}`)
            .then(res => {return res.json()})
            .then(setItemList)
        fetch(`${ip}/transaction/find-report-id?id=${historyId}`)
            .then(res => {return res.json()})
            .then(setReport)
    }

    return (
        <div className={'default-container'}>
            <div className={'left'}>
                <TransactionReportList isHistory={true}/>
            </div>
            <div className={'right'}>
                <div className={'history-right'}>
                    <div>
                        <input ref={id} readOnly={true} type="text" placeholder={'Id'}/>
                        <input ref={user} readOnly={true} type="text" placeholder={'User'}/>
                        <input ref={total} readOnly={true} type="text" placeholder={'Total'}/>
                        <input ref={timestamp} readOnly={true} type="text" placeholder={'Date'}/>
                    </div>
                    <div>
                        <table className={'product-table'}>
                            <thead>
                            <tr>
                                <th>Id</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th title={'Quantity'}>Qty</th>
                                <th title={'Discount'}>Disc</th>
                                <th>Total</th>
                            </tr>
                            </thead>
                            <tbody>
                            {itemList.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.description}</td>
                                    <td>{`\u20B1 ${fixNumber(item.price)}`}</td>
                                    <td>{item.quantity.toLocaleString()}</td>
                                    <td>{`${fixNumber(item.discount)} %`}</td>
                                    <td>{`\u20B1 ${fixNumber(item.total)}`}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

History.Layout = Layout