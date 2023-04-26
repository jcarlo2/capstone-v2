import {useContext, useEffect, useRef, useState} from "react";
import {add, fixNumber, setNavDisplay, subtract} from "../../helper/GlobalHelper";
import {ProductTable} from "../../components/table/ProductTable";
import {GlobalContext} from "../../context/GlobalContext";
import Layout from "../../components/Layout/inventory/Layout";
import {useDisposeHelper} from "../../helper/DisposeHelper";
import {useLogsHelper} from "../../helper/LogsHelper";

export default function GoodsReceipt() {
    const ip = useContext(GlobalContext).ip
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const {username} = useContext(GlobalContext).user
    const goodsCart = useContext(GlobalContext).goodsCart
    const setGoodsCart = useContext(GlobalContext).setGoodsCart
    const goodsModal = useContext(GlobalContext).modalRef.current.goodsReceipt
    const setGoodsInfo = useContext(GlobalContext).setGoodsReceiptInfo
    const [id, setId] = useState('IP0000000000001-A0')
    const save = useRef()
    const dispose = useDisposeHelper()
    const logAction = useLogsHelper()

    useEffect(()=> setNavDisplay(true),[])

    useEffect(()=> {
        if(goodsCart.length > 0) save.current.classList.remove('disabled')
        else save.current.classList.add('disabled')
    },[goodsCart])

    useEffect(()=> {
        const interval = setInterval(()=> {
            fetch(`${ip}/goods/generate?id=${id}`)
                .then(res => {return res.text()})
                .then(setId)
        },500)
        return ()=> clearInterval(interval)
    },[id])

    const showGoodsModal = (e,id,isEdit,quantity,markPrice,isDown,date)=> {
        const disposeElement = e.currentTarget.querySelector('.dispose')
        if(e === '' || !disposeElement) {
            fetch(ip + `/merchandise/find-by-id?id=${id}`)
                .then((res)=> {return res.json()})
                .then(data => {
                    console.log(data)
                    setGoodsInfo({
                        id: data.id,
                        description: data.description,
                        price: data.price,
                        isEdit: isEdit,
                        quantity: quantity ? quantity : '',
                        markPrice: isEdit ? markPrice : '',
                        isDown: isEdit ? isDown : false,
                        date: isEdit ? date : '',
                    })
                    goodsModal.classList.remove('hidden')
                })
        } else dispose(e)
    }

    const handleGoodsCartRow = (id,quantity,markPrice,isDown,date)=> {
        ipcRenderer.invoke('open-dialog-box', {
            type: 'none',
            buttons: ['Remove', 'Edit', 'Cancel'],
            message: `What to do with ${id}?\nExpiration: ${date}`,
            noLink: true,
            title: 'Goods Receipt Cart',
            defaultId: 2
        }).then(num => {
            if(num === 0) setGoodsCart(goodsCart.filter(product => product.id !== id))
            else if (num === 1) showGoodsModal('',id,true,quantity,markPrice,!isDown,date)
        })
    }

    const handleSave = ()=> {
        ipcRenderer.invoke('open-dialog-box', {
            type: 'none',
            buttons: ['Save', 'Cancel'],
            message: `Do you want to save the report?`,
            noLink: true,
            title: 'Goods Receipt Cart',
            defaultId: 0
        }).then(num => {
            if(num === 0) {
                const data = {
                    itemList: addReportIdToGoodsCart(),
                    report: {
                        id: id,
                        user: username,
                        isValid: true,
                        isArchived: false,
                        reason: 'Default',
                        link: ''
                    }
                }
                fetch(`${ip}/goods/save`,{
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                }).then(()=> {
                    ipcRenderer.send('showMessage','Goods Receipt','Success...')
                    logAction('Goods Receipt','HEHE :)')
                    setGoodsCart([])
                    save.current.classList.add('disabled')
                })
            }
        })
    }

    const addReportIdToGoodsCart = ()=> {
        return goodsCart.map(item => {
            return {
                ...item,
                reportId: id
            }
        })
    }

    return (
        <>
            <div className={'default-container'}>
                <div className="left">
                    <table className={'product-table'}>
                        <thead>
                        <tr>
                            <th>Id</th>
                            <th>Qty</th>
                            <th>New Price</th>
                        </tr>
                        </thead>
                        <tbody>
                        {goodsCart.map((item, index) => (
                            <tr key={index} onClick={()=> handleGoodsCartRow(item.id,item.quantity,item.markPrice,item.isMarkUp,item.expiration)}>
                                <td>{item.id}</td>
                                <td>{item.quantity.toLocaleString()}</td>
                                <td>&#8369; {
                                    item.isMarkUp ? fixNumber(add(item.price,item.markPrice)) : fixNumber(subtract(item.price,item.markPrice))
                                }</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <div className={'product-report'}>
                        <h3>{id}</h3>
                        <div>
                            <button ref={save} className={'btn'} onClick={handleSave}>Save</button>
                            <button className={'btn'} onClick={()=> setGoodsCart([])}>Clear</button>
                        </div>
                    </div>
                </div>
                <div className="right">
                    <ProductTable rowHandler={showGoodsModal}/>
                </div>
            </div>
        </>
    )
}

GoodsReceipt.Layout = Layout