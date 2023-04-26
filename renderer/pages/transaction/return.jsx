import Layout from "../../components/Layout/transaction/Layout";
import {TransactionReportList} from "../../components/TransactionReportList";
import {useContext, useEffect, useState} from "react";
import {fixNumber, setNavDisplay, subtract} from "../../helper/GlobalHelper";
import {GlobalContext} from "../../context/GlobalContext";
import {useRouter} from "next/router";

export default function Return() {
    const router = useRouter()
    const ip = useContext(GlobalContext).ip
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const {username} = useContext(GlobalContext).user
    const copyList = useContext(GlobalContext).copyOfReturnItemList
    const setCopyList = useContext(GlobalContext).setCopyOfReturnItemList
    const setReturnEditInfo = useContext(GlobalContext).setReturnEditModalInfo
    const setTrPayNowModalInfo = useContext(GlobalContext).setTransactionPayNowModalInfo
    const returnId = useContext(GlobalContext).returnReportId
    const returnEdit = useContext(GlobalContext).modalRef.current.transactionReturnEdit
    const itemList = useContext(GlobalContext).returnEditCart
    const setItemList = useContext(GlobalContext).setReturnEditCart
    const setAddCart = useContext(GlobalContext).setAddCart
    const setId = useContext(GlobalContext).setTransactionId
    const transactionButtons = useContext(GlobalContext).transactionButtons
    const [report, setReport] = useState({})
    const [total, setTotal] = useState(0)
    const [change, setChange] = useState(0)
    const [newId, setNewId] = useState('')

    useEffect(()=> setNavDisplay(true),[])

    useEffect(()=> {
        if(report.id !== undefined) {
            fetch(`${ip}/transaction/forward-id?id=${report.id}`)
                .then(res=> res.text())
                .then(setNewId)
        }
    },[report])

    useEffect(()=> {
        let total = itemList.map(item => item.total).reduce((acc,curr)=> acc + curr ,0)
        if(report.totalAmount !== undefined) setChange(subtract(report.totalAmount, total))
        setTotal(total)
    },[itemList])

    useEffect(()=> {
        if(returnId === '') return
        fetch(`${ip}/transaction/find-items?id=${returnId}`)
            .then(res => {return res.json()})
            .then(list => {
                setItemList(list)
                setCopyList(list)
            })
        fetch(`${ip}/transaction/find-report-id?id=${returnId}`)
            .then(res => {return res.json()})
            .then(setReport)
    },[returnId])

    const handleConfirm = ()=> {
        ipcRenderer.invoke('open-dialog-box', {
            type: 'none',
            buttons: ['Continue', 'Refund', 'Cancel'],
            message: `Do you want to add more product/s or do a refund?`,
            noLink: true,
            title: 'Return Cart',
            defaultId: 2
        }).then(num => {
            if(num === 0) handleContinue()
            else if(num === 1) handleRefund()
        })
    }

    const handleContinue = ()=> {
        setTrPayNowModalInfo({
            isReturn: true,
            credit: change,
            oldId: report.id,
            oldTotal: report.totalAmount
        })
        setId(newId)
        setAddCart(itemList)
        transactionButtons.current.add.classList.add('disabled')
        transactionButtons.current.ret.classList.remove('disabled')
        transactionButtons.current.history.classList.remove('disabled')
        router.push('/transaction/add')
    }

    const handleRefund = ()=> {
        let flag = false
        itemList.forEach(item => {
            if(item.isEdited) flag = true
        })
        if(flag) {
            const data = {
                itemList: itemList.map(item => ({
                    ...item,
                        isEdited: item.isEdited || false
                })),
                report: {
                    user: username,
                    oldId: report.id,
                    newId: newId,
                    oldTotal: report.totalAmount,
                    newTotal: total,
                    credit: change,
                }
            }
            fetch(`${ip}/transaction/return-refund`,{
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            }).then(()=> {
                ipcRenderer.send('showMessage','Return Cart',`Refund processed successfully.\nRefund: ${fixNumber(change)}`)
                setItemList([])
                setReport({})
                setTotal(0)
                setChange(0)
                setNewId('')
            }).catch(()=> ipcRenderer.send('showError','Return Cart', 'There is an error doing a refund.'))
        }else ipcRenderer.send('showError','Refund Failed','No Changes Made to Cart')
    }

    return (
        <div className={'default-container'}>
            <div className={'left'}>
                <TransactionReportList isHistory={false}/>
            </div>
            <div className={'right'}>
                <div className="return-right">
                    <div>
                        <div>
                            <div>
                                <span></span>
                                <input  value={report.id ? report.id : ''} readOnly={true} type="text" placeholder={'Report Id'}/>
                            </div>
                            <div>
                                <span></span>
                                <input value={report.user ? report.user : ''} readOnly={true} type="text" placeholder={'User'}/>
                            </div>
                            <div>
                                <span></span>
                                <input value={report.totalAmount ? `\u20B1 ${fixNumber(report.totalAmount)}` : '\u20B1 0.00'} readOnly={true} type="text" placeholder={'Total'}/>
                            </div>
                            <div>
                                <span></span>
                                <input value={report.timestamp ? report.timestamp : ''} readOnly={true} type="text" placeholder={'Date'}/>
                            </div>
                        </div>
                        <div>
                            <div>
                                <span></span>
                                <input readOnly={true} type="text" placeholder={'New Report Id'} value={newId}/>
                            </div>
                            <div>
                                <span></span>
                                <input readOnly={true} type="text" placeholder={'New User Id'} value={username}/>
                            </div>
                            <div>
                                <span></span>
                                <input readOnly={true} type="text" placeholder={'New Total'} value={`\u20B1 ${fixNumber(total)}`}/>
                            </div>
                            <div>
                                <span></span>
                                <input readOnly={true} type="text" placeholder={'Change'} value={`\u20B1 ${fixNumber(change)}`}/>
                            </div>
                        </div>
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
                                    <th>:</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itemList.map((item) => (
                                    <tr key={item.id}
                                        onClick={()=> {
                                            returnEdit.classList.remove('hidden')
                                            const index = copyList.findIndex(copy => copy.id === item.id)
                                            const arr = copyList[index]
                                            setReturnEditInfo({
                                                id: arr.id,
                                                price: arr.price,
                                                quantity: arr.quantity,
                                                total:arr.total,
                                                discount: arr.discount,
                                                currentPrice:arr.currentPrice,
                                                description: arr.description,
                                                isEdit: false
                                            })
                                        }}
                                    >
                                        <td>{item.id}</td>
                                        <td>{item.description}</td>
                                        <td>{`\u20B1 ${fixNumber(item.price)}`}</td>
                                        <td>{item.quantity.toLocaleString()}</td>
                                        <td>{`${fixNumber(item.discount)} %`}</td>
                                        <td>{`\u20B1 ${fixNumber(item.total)}`}</td>
                                        <td className={item.isEdited ? 'edited' : ''}></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div>
                            <input type="button" className={'btn'} defaultValue={'Confirm'} onClick={handleConfirm}/>
                            <input type="button" className={'btn'} defaultValue={'Reset'} onClick={()=> setItemList(copyList)}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

Return.Layout = Layout