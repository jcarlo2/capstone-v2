import {forwardRef, useContext, useEffect, useRef} from "react";
import {GlobalContext} from "../../context/GlobalContext";
import {useLogsHelper} from "../../helper/LogsHelper";

export const ProductDiscountModal = forwardRef(({id,description},ref)=> {
    const ip = useContext(GlobalContext).ip
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const productId = useContext(GlobalContext).inventoryProductId
    const discountList = useContext(GlobalContext).discountList
    const setDiscountList = useContext(GlobalContext).setDiscountList
    const setProductHistory = useContext(GlobalContext).setProductHistoryInfo
    const setDiscountHistory = useContext(GlobalContext).setDiscountHistoryInfo
    const discountModal = useContext(GlobalContext).modalRef.current.productDiscount
    const logAction = useLogsHelper()
    const discountInput = useRef()
    const quantityInput = useRef()
    const saveBtn = useRef()

    useEffect(()=> {
        discountInput.current.value = ''
        quantityInput.current.value = ''
        saveBtn.current.classList.add('disabled')
    },[productId,discountList])

    const handleSave = ()=> {
        fetch(`${ip}/merchandise/save-discount`,{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                quantity: quantityInput.current.value,
                discount: discountInput.current.value,
            })
        }).then(()=> {
            Promise.all([
                fetch(`${ip}/merchandise/find-all-discount?id=${id}`).then(res=> {return res.json()}),
                fetch(`${ip}/merchandise/find-all-history?id=${id}`).then(res=> {return res.json()}),
            ]).then(([data,histories])=> {
                ipcRenderer.send('showMessage','Product Discount', 'Discount successfully added...')
                logAction('Product Discount',
                    `Discount added for ${id}: ${quantityInput.current.value.toLocaleString()} - ${discountInput.current.value} %`)
                setDiscountList(data)
                setProductHistory(histories.historyList)
                setDiscountHistory(histories.discountHistoryList)
                discountModal.classList.add('hidden')
            })
        })
    }

    const handleQuantity = ()=> {
        let input = quantityInput.current.value
        const isDecimal = input % 1 !== 0
        if(input <= 0 || isDecimal || input === '') {
            quantityInput.current.classList.add('error')
            quantityInput.current.classList.remove('valid')
            saveBtn.current.classList.add('disabled')
        }else {
            fetch(`${ip}/merchandise/discount-exist?id=${id}&quantity=${input}`)
                .then(res=> {return res.json()})
                .then(isExist => {
                    if(isExist) {
                        quantityInput.current.classList.add('error')
                        quantityInput.current.classList.remove('valid')
                        saveBtn.current.classList.add('disabled')
                    } else {
                        quantityInput.current.classList.remove('error')
                        quantityInput.current.classList.add('valid')
                        if(discountInput.current.value !== '' || discountInput.current.value > 0) {
                            saveBtn.current.classList.remove('disabled')
                        }
                    }
                })
        }
    }

    const handleDiscount = ()=> {
        let input = quantityInput.current.value
        const isDecimal = input % 1 !== 0
        if(discountInput.current.value > 0 && input > 0 && !isDecimal) {
            saveBtn.current.classList.remove('disabled')
        }else saveBtn.current.classList.add('disabled')
    }

    return (
        <div className="modal-bg hidden" ref={ref}
            onClick={(e)=> {
                if(e.target === e.currentTarget) {
                    e.currentTarget.classList.add('hidden')
                }
            }}
        >
            <div className="modal-container  modal-h-sm product-discount-modal">
                <div className="modal-header">
                    <h1>{id}</h1>
                    <h3>{description}</h3>
                </div>
                <div className="modal-body">
                    <div>
                        <h3>Quantity</h3>
                        <input ref={quantityInput} type="number" className={'error'} onKeyUp={handleQuantity}/>
                    </div>
                    <div>
                        <h3>Discount Percentage</h3>
                        <input ref={discountInput} type="number" onChange={handleDiscount}/>
                    </div>
                </div>
                <div className="modal-footer">
                    <input ref={saveBtn} type="button" className={'btn disabled'} defaultValue={'Save'} onClick={handleSave}/>
                </div>
            </div>
        </div>
    )
})