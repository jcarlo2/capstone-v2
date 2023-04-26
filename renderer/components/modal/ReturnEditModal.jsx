import {forwardRef, useContext, useEffect, useRef, useState} from "react";
import {add, divide, fixNumber, multiply, subtract} from "../../helper/GlobalHelper";
import {GlobalContext} from "../../context/GlobalContext";

export const ReturnEditModal = forwardRef(({id,price,quantity,total,discount,currentPrice,description}, ref)=> {
    const ip = useContext(GlobalContext).ip
    const returnInfo = useContext(GlobalContext).returnEditModalInfo
    const setItemList = useContext(GlobalContext).setReturnEditCart
    const modal = useContext(GlobalContext).modalRef.current.transactionReturnEdit
    const [exchange, setExchange] = useState(0)
    const [damaged,setDamaged] = useState(0)
    const [expired,setExpired] = useState(0)
    const [retain,setRetain] = useState(0)
    const confirm = useRef()
    const [returned, setReturned] = useState(0)
    const [returnDiscount, setReturnDiscount] = useState(0)

    useEffect(()=> {
        setReturnDiscount(discount)
    },[returnInfo])

    useEffect(()=> {
        const exchangeValue = exchange.toString().length === 0 ? 0 : exchange
        const damagedValue = damaged.toString().length === 0 ? 0 : damaged
        const expiredValue = expired.toString().length === 0 ? 0 : expired
        const total = (add(add(exchangeValue,damagedValue),expiredValue))
        const isDecimal = total % 1 !== 0
        const flag = total > quantity || isDecimal || total < 0
        setReturned(total)
        setDiscount(total)
        if(flag || retain > add(expiredValue,damagedValue)) confirm.current.classList.add('disabled')
        else confirm.current.classList.remove('disabled')
    },[exchange,damaged,expired,retain])


    const setInput = (e, str)=> {
        let value = e.currentTarget.value
        if(str === 'exchanged') setExchange(value)
        else if(str === 'damaged') setDamaged(value)
        else if(str === 'expired') setExpired(value)
        else setRetain(value)
    }

    const handleRetainMaxValue = (e)=> {
        const retain = e.currentTarget.value
        setRetain(retain)
        const qty = subtract(quantity,returned)
        const isDecimal = retain % 1 !== 0
        const isEmpty = retain.toString().length === 0
        if(((isEmpty || retain === 0) && qty < 0)
            || isDecimal
            || retain > quantity
            || retain > add(damaged,expired)
            || retain < 0
            || quantity > add(add(damaged,expired),exchange)
            || qty < 0)
            confirm.current.classList.add('disabled')
        else confirm.current.classList.remove('disabled')
    }

    const setDiscount = (total)=> {
        total = quantity - total
        if(total % 1 !== 0) return
        fetch(`${ip}/merchandise/get-discount?id=${id}&quantity=${total}`)
            .then(res=> {return res.json()})
            .then(setReturnDiscount)
    }

    const calculateTotal = ()=> {
        let total = subtract(add(quantity,retain),returned)
        total = multiply(total, price)
        const percent = divide(returnDiscount, 100)
        return subtract(total, multiply(total, percent))
    }

    const handleConfirm = ()=> {
        const qty =  add(quantity,(retain.toString().length === 0 ? 0 : retain))
        const data = {
            id: id,
            exchange: exchange,
            damaged: damaged,
            expired: expired,
            price: price,
            description: description,
            discount: returnDiscount,
            quantity: subtract(qty,returned),
            total: calculateTotal(),
            isEdited: returned !== 0
        }
        setItemList(prevState => {
            const index = prevState.findIndex(item => item.id === data.id);
            if (index >= 0) {
                return [
                    ...prevState.slice(0, index),
                    { ...prevState[index], ...data },
                    ...prevState.slice(index + 1)
                ]
            } else {
                return [
                    ...prevState,
                    data
                ]
            }
        })
        modal.classList.add('hidden')
        setExchange(0)
        setDamaged(0)
        setExpired(0)
        setRetain(0)
    }

    return (
        <>
            <div className="modal-bg hidden" ref={ref}
                onClick={(e)=> {
                    if(e.target === e.currentTarget) {
                        e.currentTarget.classList.add('hidden')
                        setExchange(0)
                        setDamaged(0)
                        setExpired(0)
                        setRetain(0)
                    }
                }}
            >
                <div className="modal-container modal-lg modal-h-sm" id={'return-edit'}>
                    <div className="modal-header">
                        <div>
                            <h1>{id}</h1>
                            <h3>&#8369; {fixNumber(price)}</h3>
                        </div>
                        <div>
                            <h1>QTY: {`${quantity}`.toLocaleString()}</h1>
                            <h3>Current Price: &#8369; {fixNumber(currentPrice)}</h3>
                        </div>
                    </div>
                    <div className="modal-body">
                        <div>
                            <input value={`${subtract(add(quantity,retain),returned)}`.toLocaleString()} readOnly={true} type="text" placeholder={'Qty'}/>
                            <input value={`${fixNumber(returnDiscount)} %`} readOnly={true} type="text" placeholder={'Discount'}/>
                            <input value={`\u20B1 ${fixNumber(calculateTotal())}`} readOnly={true} type="text" placeholder={'Total'}/>
                        </div>
                        <div>
                            <div>
                                <h2>Exchange</h2>
                                <input value={exchange} type="number" onChange={(e)=> setInput(e,'exchanged')}/>
                            </div>
                            <div>
                                <h2>Damaged</h2>
                                <input value={damaged} type="number" onChange={(e)=> setInput(e,'damaged')}/>
                            </div>
                            <div>
                                <h2>Expired</h2>
                                <input value={expired} type="number" onChange={(e)=> setInput(e,'expired')}/>
                            </div>
                            <div>
                                <h2>Retain</h2>
                                <input value={retain} type="number" onChange={(e)=> handleRetainMaxValue(e)}/>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <input ref={confirm} type="button" className={'btn disabled'} defaultValue={'Confirm'} onClick={handleConfirm}/>
                    </div>
                </div>
            </div>
        </>
    )
})