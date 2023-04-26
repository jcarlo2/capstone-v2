import Layout from "../../components/Layout/inventory/Layout";
import {ProductTable} from "../../components/table/ProductTable";
import {useContext, useEffect} from "react";
import {fixNumber, setNavDisplay} from "../../helper/GlobalHelper";
import {GlobalContext} from "../../context/GlobalContext";
import {useLogsHelper} from "../../helper/LogsHelper";
import {useDisposeHelper} from "../../helper/DisposeHelper";

export default function Product() {
    const ip = useContext(GlobalContext).ip
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const id = useContext(GlobalContext).inventoryProductId
    const setId = useContext(GlobalContext).setInventoryProductId
    const info = useContext(GlobalContext).inventoryProductInfo
    const setInfo = useContext(GlobalContext).setInventoryProductInfo
    const setCategoryInfo = useContext(GlobalContext).setInventoryProductCategoryInfo
    const setDiscountInfo = useContext(GlobalContext).setInventoryProductDiscountInfo
    const discountList = useContext(GlobalContext).discountList
    const setDiscountList = useContext(GlobalContext).setDiscountList
    const setPrivateList = useContext(GlobalContext).setPrivateCategoryList
    const categoryModal = useContext(GlobalContext).modalRef.current.productCategory
    const updateModal = useContext(GlobalContext).modalRef.current.productUpdate
    const discountModal = useContext(GlobalContext).modalRef.current.productDiscount
    const historyModal = useContext(GlobalContext).modalRef.current.productHistory
    const addModal = useContext(GlobalContext).modalRef.current.productAdd
    const setProductHistory = useContext(GlobalContext).setProductHistoryInfo
    const setDiscountHistory = useContext(GlobalContext).setDiscountHistoryInfo
    const logAction = useLogsHelper()
    const dispose = useDisposeHelper()

    useEffect(()=> setNavDisplay(true),[])

    useEffect(()=> {
        if (id !== '') {
            Promise.all([
                fetch(`${ip}/merchandise/find-by-id?id=${id}`).then(res => res.json()),
                fetch(`${ip}/merchandise/find-all-discount?id=${id}`).then(res => res.json()),
                fetch(`${ip}/merchandise/find-all-category?id=${id}`).then(res => res.json())
            ]).then(([info, discountList, privateList]) => {
                        setInfo(info);
                        setCategoryInfo(info);
                        setDiscountList(discountList);
                        setPrivateList(privateList);
                })
        } else {
            setInfo({
                id: '',
                description: '',
                price: '',
                piecesPerBox: ''
            });
            setCategoryInfo({
                id: '',
                description: ''
            });
            setPrivateList([]);
            setDiscountList([]);
        }
    },[id])

    const removeDiscount = (quantity,discount)=> {
        fetch(`${ip}/merchandise/remove-discount`,{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                quantity: quantity,
                discount: discount
            })
        }).then(()=> {
            Promise.all([
                fetch(`${ip}/merchandise/find-all-discount?id=${id}`).then(res=> {return res.json()}),
                fetch(`${ip}/merchandise/find-all-history?id=${id}`).then(res=> {return res.json()}),
            ]).then(([data,histories])=> {
                ipcRenderer.send('showMessage','Product Discount','Discount removed...')
                logAction('Product Discount',`Remove discount: ${id} :: ${quantity} :: ${discount}`)
                setProductHistory(histories.historyList)
                setDiscountHistory(histories.discountHistoryList)
                setDiscountList(data)
                discountModal.classList.add('hidden')
            })
        })
    }

    const showModal = (modal)=> {
        if(id !== '') modal.classList.remove('hidden')
    }

    const handleProductTableRowClick = (e,id)=> {
        const disposeElement = e.currentTarget.querySelector('.dispose')
        if(disposeElement) {
            dispose(id)
            setId('')
        }
        else setId(id)
    }

    return (
        <>
            <div className={'default-container'}>
                <div className="left product-view">
                    <div className={'top'}>
                        <input value={info.id} type="text" readOnly={true} placeholder={'Id'} title={info.id}/>
                        <input value={info.description} type="text" readOnly={true} placeholder={'Description'} title={info.description}/>
                        <input value={info.price === '' ? '' : `\u20B1 ${fixNumber(info.price)}`} type="text" readOnly={true} placeholder={'Price'}/>
                        <div>
                            <input onClick={()=> showModal(updateModal)} type="button" className={'btn'} defaultValue={'Update'}/>
                            <input onClick={()=> showModal(categoryModal)} type="button" className={'btn'} defaultValue={'Categories'}/>
                        </div>
                    </div>
                    <div className={'mid'}>
                        <div>
                            <h1>Discount</h1>
                            <div>
                                <input type="button" className={'btn'} onClick={()=> {
                                    showModal(discountModal)
                                    setDiscountInfo({
                                        quantity: 0,
                                        percent: 0
                                    })
                                }}/>
                                <input type="button" className={'btn'} onClick={()=> showModal(historyModal)} defaultValue={'History'}/>
                            </div>
                        </div>
                        <div>
                            <table className="product-table">
                                <thead>
                                    <tr>
                                        <th>Quantity</th>
                                        <th>Discount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        discountList.map(item => (
                                            <tr key={item.quantity}
                                                onClick={()=> {
                                                    ipcRenderer.invoke('open-dialog-box', {
                                                        type: 'none',
                                                        buttons: ['Remove', 'Cancel'],
                                                        message: `Do you want to remove the discount? ${item.quantity} quantity :: ${item.discount} %`,
                                                        noLink: true,
                                                        title: 'Inventory Loss',
                                                        defaultId: 0
                                                    }).then(num => {
                                                        if(num === 0) removeDiscount(item.quantity, item.discount)
                                                    })
                                                }}
                                            >
                                                <td>{item.quantity.toLocaleString()}</td>
                                                <td>{fixNumber(item.discount)} %</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="bot">
                        <input type="button" className={'btn'} defaultValue={'Add'}
                            onClick={()=> {
                                addModal.classList.remove('hidden')
                            }}
                        />
                        <input type="button" className={'btn'} defaultValue={'Clear'}
                            onClick={()=> setId('')}
                        />
                    </div>
                </div>
                <div className="right">
                    <ProductTable rowHandler={handleProductTableRowClick}/>
                </div>
            </div>
        </>
    )
}

Product.Layout = Layout