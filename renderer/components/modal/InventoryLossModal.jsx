import {forwardRef, useContext, useRef, useState} from "react";
import {GlobalContext} from "../../context/GlobalContext";
import {multiply} from "../../helper/GlobalHelper";

export const InventoryLossModal = forwardRef(({id,description,quantity, isEdit,price},ref)=> {
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const modal = useContext(GlobalContext).modalRef.current.inventoryLoss
    const lossCart = useContext(GlobalContext).lossCart
    const setLossCart = useContext(GlobalContext).setLossCart
    const confirm = useRef()
    const input = useRef()
    const [reason, setReason] = useState('Damaged')

    const updateCart = ()=> {
        const updatedLossCart = lossCart.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    quantity: input.current.value,
                    reason: reason
                }
            }
            return item
        })
        setLossCart(updatedLossCart)
    }
    const addToCart = ()=> {
        let flag = true
        lossCart.map(item => {
            if(item.id === id) {
                ipcRenderer.send('showError','Inventory Loss Cart', 'Duplicate Product')
                flag = false
            }
        })
        if(flag) {
            setLossCart(prevState => [
                ...prevState,
                {
                    id: id,
                    description: description,
                    quantity: input.current.value,
                    price: price,
                    total: multiply(price,input.current.value),
                    reason: reason,
                }
            ])
        }
    }

    return (
        <div className="modal-bg hidden" ref={ref}
             onClick={(e)=> {
                 if(e.target === e.currentTarget) {
                     e.currentTarget.classList.toggle('hidden')
                     input.current.value = ''
                     setReason('Damaged')
                     confirm.current.classList.add('disabled')
                 }
             }}
        >
            <div className="modal-container modal-h-sm modal-lg" id={'loss-modal'}>
                <div className="modal-header">
                    <div>
                        <h1>{id?.length > 20 ? `${id.substring(0,20)}...` : id}</h1>
                        <h3>{description?.length > 40 ? `${description.substring(0,40)}...` : description}</h3>
                    </div>
                    <div>
                        <h1>{`Qty: ${quantity.toLocaleString()}`}</h1>
                    </div>
                </div>
                <div className="modal-body">
                    <div>
                        <input type="button" className={'btn'} value={reason}
                            onClick={()=> {
                                if(reason === 'Damaged') setReason('Expired')
                                else setReason('Damaged')
                            }}
                        />
                        <input ref={input} type="number" placeholder={'Quantity'}
                           onChange={(e)=> {
                               const value = e.currentTarget.value
                               const isDecimal = value % 1  !== 0
                               if(value === '' || value > quantity || value <= 0 || isDecimal) confirm.current.classList.add('disabled')
                               else confirm.current.classList.remove('disabled')
                           }}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <input ref={confirm} type="button" className={'btn disabled'} defaultValue={'Confirm'}
                        onClick={()=> {
                            if(isEdit) updateCart()
                            else addToCart()
                            modal.classList.add('hidden')
                            input.current.value = ''
                        }}
                    />
                </div>
            </div>
        </div>
    )
})