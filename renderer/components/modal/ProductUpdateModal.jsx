import {forwardRef, useContext, useEffect, useRef} from "react";
import {GlobalContext} from "../../context/GlobalContext";
import {fixNumber} from "../../helper/GlobalHelper";
import {useLogsHelper} from "../../helper/LogsHelper";

export const ProductUpdateModal = forwardRef(({id,description,quantity,piecesPerBox,price},ref)=> {
    const ip = useContext(GlobalContext).ip
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const info = useContext(GlobalContext).inventoryProductInfo
    const quantityInput = useRef()
    const descriptionInput = useRef()
    const priceInput = useRef()
    const piecesPerBoxInput = useRef()
    const setInfo = useContext(GlobalContext).setInventoryProductInfo
    const setProductHistory = useContext(GlobalContext).setProductHistoryInfo
    const setDiscountHistory = useContext(GlobalContext).setDiscountHistoryInfo
    const updateModal = useContext(GlobalContext).modalRef.current.productUpdate
    const logAction = useLogsHelper()

    useEffect(()=> {
        quantityInput.current.value = quantity
        descriptionInput.current.value = description
        priceInput.current.value = `${fixNumber(price)}`
        piecesPerBoxInput.current.value = piecesPerBox.toLocaleString()
    },[info])

    const handleUpdate = ()=> {
        fetch(`${ip}/merchandise/update-info`,{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                description: descriptionInput.current.value,
                price: priceInput.current.value,
                piecesPerBox: piecesPerBoxInput.current.value,
                quantity: quantity
            })
        }).then((e)=> {
            console.log(e)
            Promise.all([
                fetch(`${ip}/merchandise/find-by-id?id=${id}`).then(res=> {return res.json()}),
                fetch(`${ip}/merchandise/find-all-history?id=${id}`).then(res=> {return res.json()}),
            ]).then(([data,histories])=> {
                ipcRenderer.send('showMessage','Product Update','Updated successfully...')
                logAction(`Product Update`,
                    `${id}:${description} - \u20B1 ${fixNumber(priceInput.current.value)} - Pieces Per Box: ${piecesPerBoxInput.current.value.toLocaleString()}`)
                setInfo(data)
                setProductHistory(histories.historyList)
                setDiscountHistory(histories.discountHistoryList)
                updateModal.classList.add('hidden')
            })
        })
    }

    return (
        <div className="modal-bg hidden" ref={ref}
            onClick={(e)=> {
                if(e.target === e.currentTarget) {
                    e.currentTarget.classList.add('hidden')
                }
            }}
        >
            <div className="modal-container modal-h-md product-update-modal">
                <div className="modal-header">
                    <h1>{id}</h1>
                    <h3>&#8369; {fixNumber(price)}</h3>
                </div>
                <div className="modal-body">
                    <div>
                        <h3>Description</h3>
                        <input ref={descriptionInput} type="text" placeholder={'Description'}/>
                    </div>
                    <div>
                        <h3>Price</h3>
                        <input ref={priceInput} type="text" placeholder={'Price'}/>
                    </div>
                    <div>
                        <h3>Pieces Per Box</h3>
                        <input ref={piecesPerBoxInput} type="text" placeholder={'Pieces Per Box'}/>
                    </div>
                    <div>
                        <h3>Quantity</h3>
                        <input ref={quantityInput} type="text" placeholder={'Quantity'} readOnly={true}/>
                    </div>
                </div>
                <div className="modal-footer">
                    <input type="button" className={'btn'} defaultValue={'Update'} onClick={handleUpdate}/>
                </div>
            </div>
        </div>
    )
})