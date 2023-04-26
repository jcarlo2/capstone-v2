import {forwardRef, useContext, useEffect, useRef, useState} from "react";
import {divide, fixNumber, isValidNumber, multiply, subtract} from "../../helper/GlobalHelper";
import {GlobalContext} from "../../context/GlobalContext";

export const TransactionAddModal = forwardRef(({productId,price,description,isReturn},ref)=> {
    const [total, setTotal] = useState(0)
    const [quantity,setQuantity] = useState(0)
    const [discount, setDiscount] = useState(0)
    const addBtn = useRef()
    const trAddModalInfo = useContext(GlobalContext).trAddModalInfo
    const ip = useContext(GlobalContext).ip
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const addCart = useContext(GlobalContext).addCart
    const setAddCart = useContext(GlobalContext).setAddCart
    const transactionAddModal = useContext(GlobalContext).modalRef.current.transactionAdd
    const [isEdit, setIsEdit] = useState(false)

    useEffect(()=> {
        setIsEdit(parseFloat(trAddModalInfo.quantity) > 0)
        const quantity = trAddModalInfo.quantity
        setQuantity(quantity === 0 ? '' : quantity)
        setDiscount(trAddModalInfo.discount)
    },[trAddModalInfo])

    const addBtnOnClickHandler = ()=> {
        addToCart(productId,quantity,total,isEdit,discount)
        addBtn.current.classList.add('disabled')
    }

    const onKeyUpHandler = (e)=> {
        const quantity = e.currentTarget.value
        if(isValidNumber(parseFloat(quantity))) {
            fetch(`${ip}/merchandise/get-discount?id=${productId}&quantity=${quantity}`)
                .then(res => {return res.text()})
                .then(res => {
                    const discount = parseFloat(res)
                    const disc = divide(discount,100)
                    const total = multiply(quantity, price)
                    const totalDisc = multiply(disc, total)
                    setDiscount(discount)
                    setTotal(subtract(total,totalDisc))
                    addBtn.current.classList.remove('disabled')
                })
        } else {
            setTotal(0)
            addBtn.current.classList.add('disabled')
        }
    }

    const onChangeHandler = (e)=> {
        let quantity = e.currentTarget.value
        if(quantity.charAt(0) === '0') quantity = quantity.substring(1)
        setQuantity(quantity)
    }

    const addToCart = (productId, quantity, total, isEdit,discount)=> {
        fetch(ip + `/merchandise/check-stock?id=${productId}&quantity=${quantity}`)
            .then(res => {return res.json()})
            .then(hasStock => {
                if(hasStock) {
                    let flag = true
                    addCart.forEach(product => {
                        if(product.id === productId)  flag = false
                    })
                    if(flag && !isEdit) {
                        setAddCart((prevState)=> [
                            ...prevState,
                            {
                                id: productId,
                                quantity: quantity,
                                total: total,
                                discount: discount,
                                price: price,
                                description: description
                            }
                        ])
                    } else if(!flag && isEdit) {
                        setAddCart(prevState => {
                            return prevState.map(product => {
                                if (product.id === productId) {
                                    return {
                                        ...product,
                                        quantity: quantity,
                                        total: total,
                                        discount: discount,
                                        price: price,
                                        description: description
                                    };
                                } else {
                                    return product;
                                }
                            });
                        });
                    } else if(!flag && !isEdit) ipcRenderer.send('showError','Loss To Cart', 'Duplicate Product')
                    transactionAddModal.classList.add('hidden')
                }else ipcRenderer.send('showError','Loss To Cart', 'Insufficient quantity')
            })
    }

    return (
        <div className={'modal-bg hidden'} id={'transaction-add-modal'} ref={ref}
             onClick={(e)=> {
                 if(e.target === e.currentTarget) {
                     e.currentTarget.classList.toggle('hidden')
                     setTotal(0)
                     addBtn.current.classList.add('disabled')
                 }
             }}>
            <div className="modal-container">
                <div className="modal-header ta-header">
                    <h1>{productId}</h1>
                    <h2>&#8369; {fixNumber(price)}</h2>
                </div>
                <div className="modal-body ta-body">
                    <div>
                        <h3>Quantity</h3>
                        <input value={quantity} type="number"
                               id={'tr-add-quantity'}
                               onChange={(e)=> onChangeHandler(e) }
                               onKeyUp={(e)=> onKeyUpHandler(e)}/>
                    </div>
                    <div>
                        <h3>Price</h3>
                        <input value={`\u20B1 ${fixNumber(price)}`} type="text" readOnly={true}/>
                    </div>
                    <div>
                        <h3>Discount</h3>
                        <input value={`${discount} %`} placeholder={'Discount'} type="text" readOnly={true}/>
                    </div>
                    <div>
                        <h3>Total</h3>
                        <input value={`\u20B1 ${fixNumber(total)}`} type="text" readOnly={true}/>
                    </div>
                </div>
                <div className="modal-footer ta-footer">
                    <input ref={addBtn} type="button" className={'btn'} defaultValue={'Add To Cart'}
                        onClick={addBtnOnClickHandler}
                    />
                </div>
            </div>
        </div>
    )
})