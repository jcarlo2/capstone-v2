import {forwardRef, useContext, useEffect, useRef, useState} from "react";
import {add, divide, fixNumber, multiply, subtract} from "../../helper/GlobalHelper";
import {GlobalContext} from "../../context/GlobalContext";

export const GoodsReceiptModal = forwardRef(({id, description, price, quantity,isEdit,initIsDown,markPrice,initDate}, ref)=> {
    const ip = useContext(GlobalContext).ip
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const goodsCart = useContext(GlobalContext).goodsCart
    const setGoodsCart = useContext(GlobalContext).setGoodsCart
    const goodsInfo = useContext(GlobalContext).goodsReceiptInfo
    const goodsModal = useContext(GlobalContext).modalRef.current.goodsReceipt
    const [minDate, setMinDate] = useState('01-01-2000')
    const [isDown, setIsDown] = useState(false)
    const [intervalMinDate, setIntervalMinDate] = useState(0)
    const quantityInput = useRef()
    const newPrice = useRef()
    const mark = useRef()
    const date = useRef()
    const confirm = useRef()

    useEffect(()=> handleMinDate(),[])

    useEffect(()=> {
        if(minDate !== '01-01-2000') clearInterval(intervalMinDate)
    },[minDate])

    useEffect(()=> {
        quantityInput.current.value = quantity
        date.current.value = initDate
        setIsDown(initIsDown)
        mark.current.value = markPrice
        const nPrice = initIsDown ? subtract(price,markPrice) : add(price,markPrice)
        if(markPrice !== '') newPrice.current.value = `\u20B1 ${fixNumber(nPrice)}`
        else newPrice.current.value = ''
    },[goodsInfo])

    useEffect(()=> {handleMarkPrice()},[isDown])

    const handleMinDate = ()=> {
        setIntervalMinDate(setInterval(()=> {
            fetch(`${ip}/date/get-date`)
                .then(res => {return res.text()})
                .then(date => {
                    setMinDate(date.split(' ')[0])
                })
        },1000))
    }

    const handleMarkPrice = ()=> {
        const qty = parseFloat(quantityInput.current.value) || 0
        const isNotDecimal = qty % 1 === 0
        let value = parseFloat(mark.current.value) || 0
        if(value < 0) {
            confirm.current.classList.add('disabled')
            return
        }else if( qty > 0 && isNotDecimal && date.current.value !== '') {
            confirm.current.classList.remove('disabled')
        }
        if(value === 0) newPrice.current.value = ''
        else {
            value = isDown ? subtract(price,value) : add(price,value)
            newPrice.current.value = `\u20B1 ${fixNumber(value)}`
        }
    }

    const handleDate = ()=> {
        const qty = quantityInput.current.value === '' ? 0 : quantityInput.current.value
        const addedPrice = mark.current.value === '' ? 0 : mark.current.value
        if(parseFloat(qty) < 1 ||  addedPrice < 0) {
            confirm.current.classList.add('disabled')
            return
        }
        confirm.current.classList.remove('disabled')
    }

    const handleQuantity = ()=> {
        const qty = parseFloat(quantityInput.current.value);
        const addedPrice = parseFloat(mark.current.value) || 0;
        const isDecimal = qty % 1 !== 0
        if(qty < 1 || date.current.value === '' ||  addedPrice < 0 || isDecimal) {
            confirm.current.classList.add('disabled')
            return
        }
        confirm.current.classList.remove('disabled')
    }

    const handleConfirm = ()=> {
        if(isEdit) {
            setGoodsCart(goodsCart.map(item => {
                if (item.id === id) {
                    return {
                        ...item,
                        quantity: quantityInput.current.value,
                        markPrice: mark.current.value === '' ? 0 : mark.current.value,
                        isMarkUp: !isDown,
                        expiration: date.current.value
                    }
                } else return item
            }))
        }else {
            let flag = true
            const markPrice = mark.current.value === '' ? 0 : mark.current.value
            const percent = isDown ? (multiply(divide(markPrice,price),100) * -1) : multiply(divide(markPrice,price),100)
            goodsCart.map(item => {
                if(item.id === id) flag = false
            })
            if(flag) setGoodsCart(prevState => [
                ...prevState,
                {
                    id: id,
                    description: description,
                    price: price,
                    quantity: quantityInput.current.value,
                    markPrice: markPrice,
                    markPercent: percent,
                    isMarkUp: !isDown,
                    expiration: date.current.value,
                }
            ])
            else ipcRenderer.send('showError', 'Goods Receipt', 'Duplicate Product')
        }
        goodsModal.classList.add('hidden')
        reset()
    }

    const reset = ()=> {
        setIsDown(false)
        confirm.current.classList.add('disabled')
        quantityInput.current.value = ''
        mark.current.value = ''
        newPrice.current.value = ''
        date.current.value = ''
    }

    return (
        <div className="modal-bg hidden" ref={ref}
            onClick={(e)=> {
                if(e.target === e.currentTarget) {
                    e.currentTarget.classList.add('hidden')
                    reset()
                }
            }}
        >
            <div className="modal-container modal-h-sm modal-lg" id={'goods-modal'}>
                <div className="modal-header">
                    <div>
                        <h1>{id.length > 18 ? id.substring(0,18) : id}</h1>
                        <h3>{description.length > 40 ? description.substring(0,40) : description}</h3>
                    </div>
                    <h1>Price: &#8369; {fixNumber(price)}</h1>
                </div>
                <div className="modal-body">
                    <div>
                        <input ref={quantityInput} type="number" placeholder={'Quantity'} onChange={handleQuantity}/>
                        <input ref={newPrice} type="text" readOnly={true} placeholder={'New Price'}/>
                    </div>
                    <div>
                        <input ref={mark} type="number" placeholder={'Mark Price'} onChange={handleMarkPrice}/>
                        <span className={isDown ? 'down' : ''}
                            onClick={()=> setIsDown(!isDown)}
                        ></span>
                    </div>
                    <input ref={date} type="date" min={minDate} onChange={handleDate}/>
                </div>
                <div className="modal-footer">
                    <input ref={confirm} type="button" defaultValue={'Confirm'} className={'disabled btn'} onClick={handleConfirm}/>
                </div>
            </div>
        </div>
    )
})