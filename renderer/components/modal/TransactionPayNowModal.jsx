import {forwardRef, useContext, useEffect, useRef, useState} from "react";
import {ReportItemsTableRow} from "../table/ReportItemsTableRow";
import {GlobalContext} from "../../context/GlobalContext";
import {add, addAll, fixNumber} from "../../helper/GlobalHelper";
import {useLogsHelper} from "../../helper/LogsHelper";

export const TransactionPayNowModal = forwardRef(({isReturn, credit,oldId,oldTotal},ref)=> {
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const ip = useContext(GlobalContext).ip
    const transactionPayNowModal = useContext(GlobalContext).modalRef.current.transactionPayNow
    const {username} = useContext(GlobalContext).user
    const addCart = useContext(GlobalContext).addCart
    const setAddCart = useContext(GlobalContext).setAddCart
    const id = useContext(GlobalContext).transactionId
    const setPayNowInfo = useContext(GlobalContext).setTransactionPayNowModalInfo
    const setItemList = useContext(GlobalContext).setReturnEditCart
    const setReturnId = useContext(GlobalContext).setReturnReportId
    const payment = useRef()
    const payNow = useRef()
    const [total, setTotal] = useState(0)
    const [change, setChange] = useState(0)
    const logsAction = useLogsHelper()

    useEffect(()=> {
        const total = addAll(addCart,'total')
        setTotal(total)
        setChange(add(payment.current.value,credit) - total)
    },[addCart])

    const setInputBorderAndButtonDisabled = (change)=> {
        const input = payment.current
        const value = input.value === '' ? 0 : input.value
        change = add((-1 * total), add(credit,value))
        if(change < 0 || value < 0) {
            input.classList.remove('success')
            input.classList.add('error')
            payNow.current.classList.add('disabled')
        } else {
            input.classList.remove('error')
            input.classList.add('success')
            payNow.current.classList.remove('disabled')
        }
        return change
    }

    const onPayNowHandler = () => {
        const data = {
            itemList: setAddCartProperties(),
            report: {
                id: id,
                user: username,
                timestamp: '',
                isValid: true,
                isArchived: false,
                totalAmount: total,
                credit: 0,
            }
        }
        if(isReturn) handleReturnTransaction(data)
        else handleSaveNewTransaction(data)
    }

    const handleReturnTransaction = ({itemList,report})=> {
        const data = setReturnProperties(itemList,report)
        fetch(`${ip}/transaction/return-refund`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(()=> {
            ipcRenderer.send('showMessage','Transaction Return',`Processed successfully.\nRefund: ${fixNumber(change)}`)
            logsAction('Transaction Return',`${data.report.newId}: refund \u20B1 ${fixNumber(change)}`)
            setItemList([])
            setPayNowInfo({
                isReturn: false,
                credit: 0,
                oldId: '',
                oldTotal: 0
            })
            setReturnId('')
            reset()
        })
    }

    const handleSaveNewTransaction = (data)=> {
        fetch(`${ip}/transaction/save`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(res => {return res.json()})
            .then(data => {
                if(data.length === 0) {
                    ipcRenderer.send('showMessage','Transaction Loss', `Success ...\nThe Change is \u20B1 ${fixNumber(change)}`)
                    logsAction('Transaction Add',`${id}: \u20B1 ${total}`)
                    reset()
                } else {
                    const outOfStockItems = data.join('::')
                    ipcRenderer.send('showError','Transaction Loss',
                        `Some products are out of stock, update the cart.\n${outOfStockItems}`
                    )
                }
            })
    }

    const reset = ()=> {
        payment.current.value = ''
        setAddCart([])
        setChange(0)
        setInputBorderAndButtonDisabled(-1)
        transactionPayNowModal.classList.add('hidden')
    }

    const setReturnProperties = (itemList)=> {
        const id = itemList[0].reportId
        const newTotal = itemList.map(item => item.total).reduce((arr,curr)=> arr + curr,0)
        const newItemList = itemList.map(item => ({
            ...item,
            reportId: id,
            exchange: item.exchange ? item.exchange : 0,
            damaged: item.damaged ? item.damaged : 0,
            expired: item.expired ? item.expired : 0,
            currentPrice: item.currentPrice ? item.currentPrice : item.price,
            isEdited: item.isEdited ? item.isEdited : false,
        }))
        const newReport = {
            user: username,
            newId: id,
            oldId: oldId,
            oldTotal: oldTotal,
            newTotal: newTotal,
            credit: credit
        }
        return {itemList: newItemList,report: newReport}
    }

    const setAddCartProperties = () => {
        return addCart.map((item) => {
            return {
                ...item,
                currentPrice: 0,
                reportId: id,
            }
        })
    }

    return (
        <div className={'modal-bg hidden'} ref={ref}
             id={'transaction-pay-now-modal'}
             onClick={(e)=> {
                 if(e.target === e.currentTarget) {
                     e.currentTarget.classList.toggle('hidden')
                     payment.current.value = ''
                     setChange(setInputBorderAndButtonDisabled(change))
                 }
             }}>
            <div className="modal-container modal-xl">
                <div className="modal-header pay-header">
                    <input ref={payment} type="number" className={'error'} placeholder={'Payment'} id={'tr-pay-now'}
                        onChange={()=> {
                            setChange(setInputBorderAndButtonDisabled(change))
                        }}
                    />
                    <span className={'hidden'}></span>
                    <input value={`\u20B1 ${fixNumber(credit)}`} className={isReturn ? '' : 'hidden' } type="text" readOnly={true} placeholder={'Credit'}/>
                    <span></span>
                    <input value={`\u20B1 ${fixNumber(total)}`} type="text" readOnly={true} placeholder={'Total'}/>
                    <span></span>
                    <input value={`\u20B1 ${fixNumber(change)}`} type="text" readOnly={true} placeholder={'Change'}/>
                </div>
                <div className="modal-body pay-body">
                    <table>
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Disc</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <ReportItemsTableRow/>
                        </tbody>
                    </table>
                </div>
                <div className="modal-footer pay-footer">
                    <div>
                        <h3>{username}</h3>
                        <h3>{id}</h3>
                    </div>
                    <div>
                        <input ref={payNow} type="button" defaultValue={'Pay Now'} className={'btn disabled'}
                               onClick={onPayNowHandler}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
})