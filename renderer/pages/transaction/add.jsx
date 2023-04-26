import {useContext, useEffect, useState} from "react";
import Layout from "../../components/Layout/transaction/Layout";
import {GlobalContext} from "../../context/GlobalContext";
import {addAll, fixNumber, setNavDisplay} from "../../helper/GlobalHelper";
import {TransactionAddLeftTable} from "../../components/table/TransactionAddLeftTable";
import {ProductTable} from "../../components/table/ProductTable";
import {useRouter} from "next/router";
import {useDisposeHelper} from "../../helper/DisposeHelper";

export default function Add() {
    const router = useRouter()
    const ip = useContext(GlobalContext).ip
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const addCart = useContext(GlobalContext).addCart
    const setAddCart = useContext(GlobalContext).setAddCart
    const setTrAddModalInfo = useContext(GlobalContext).setTrAddModalInfo
    const trPayNowModalInfo = useContext(GlobalContext).transactionPayNowModalInfo
    const transactionButtons = useContext(GlobalContext).transactionButtons
    const modalRef = useContext(GlobalContext).modalRef.current
    const id = useContext(GlobalContext).transactionId
    const setId = useContext(GlobalContext).setTransactionId
    const [disabled, setDisabled] = useState('disabled')
    const [isReturn, setIsReturn] = useState(false)
    const dispose = useDisposeHelper()

    useEffect(()=> {
        setNavDisplay(true)
    },[])

    useEffect(()=> {
        setDisabled(`${!(addCart.length > 0) ? 'disabled' : ''}`)
    },[addCart.length])

    useEffect(()=> {
        const interval = setInterval(()=> {
            fetch(`${ip}/transaction/generate?id=${id}`)
                .then(res => {return res.text()})
                .then(setId)
        },500)
        return ()=> clearInterval(interval)
    },[id])

    useEffect(()=> {
        setIsReturn(trPayNowModalInfo.isReturn)
    },[trPayNowModalInfo])

    const showTransactionAddModal = (e,id,quantity,isEdit)=> {
        const disposeElement = e.currentTarget.querySelector('.dispose')
        if(e === '' || !disposeElement) {
            fetch(ip + `/merchandise/find-by-id?id=${id}`)
                .then((res)=> {return res.json()})
                .then(data => {
                    const discount = findDiscount(id)
                    setTrAddModalInfo(prevState => ({
                        ...prevState,
                        price: data.price,
                        id: data.id,
                        quantity: isEdit ? quantity : 0,
                        discount: isEdit ? discount : 0,
                        description: data.description,
                    }))
                    modalRef.transactionAdd.classList.remove('hidden')
                    const input = document.querySelector('#tr-add-quantity')
                    input.focus()
                })
        }else dispose(id)
    }

    const findDiscount = (id)=> {
        let discount = 0
        addCart.forEach(product => {
            if(product.id === id) discount = product.discount
        })
        return discount
    }

    const showTransactionPayNowModal = ()=> {
        modalRef.transactionPayNow.classList.remove('hidden')
        const input = document.querySelector('#tr-pay-now')
        input.focus()
    }

    const cartClickHandler = (id,quantity)=> {
        ipcRenderer.invoke('open-dialog-box', {
            type: 'none',
            buttons: ['Remove', 'Edit', 'Cancel'],
            message: `What to do with ${id}?`,
            noLink: true,
            title: 'Transaction Loss Cart',
            defaultId: 2
        }).then((num)=> {
            if(num === 0) setAddCart(addCart.filter(product => product.id !== id))
            else if (num === 1) showTransactionAddModal('',id,quantity,true)
        })
    }

    return (
        <div className={'default-container'}>
            <div className={'left'}>
                <table className={'product-table'}>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Qty</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <TransactionAddLeftTable onClickHandler={cartClickHandler} isReturn={isReturn}/>
                    </tbody>
                </table>
                <div className={'product-report'}>
                    <h2>Total Price: &#8369; {fixNumber(addAll(addCart,'total'))}</h2>
                    <h3>{id}</h3>
                    <div>
                        <button className={`${disabled}`} onClick={showTransactionPayNowModal}>Pay now</button>
                        <button onClick={()=> {
                            if(isReturn) {
                                ipcRenderer.invoke('open-dialog-box', {
                                    type: 'none',
                                    buttons: ['Go back', 'No'],
                                    message: `Do you want to go back?\nIt will reset your cart changes.`,
                                    noLink: true,
                                    title: 'Return Cart',
                                    defaultId: 0
                                }).then(num => {
                                    if(num === 0) {
                                        setTrAddModalInfo({
                                            isReturn: false,
                                            credit: 0
                                        })
                                        transactionButtons.current.add.classList.remove('disabled')
                                        transactionButtons.current.ret.classList.add('disabled')
                                        transactionButtons.current.history.classList.remove('disabled')
                                        router.push('/transaction/return')
                                    }
                                })
                            }else setAddCart([])
                        }}>{isReturn ? 'Go Back' : 'Clear'}</button>
                    </div>
                </div>
            </div>
            <div className={'right'}>
                <ProductTable rowHandler={showTransactionAddModal}/>
            </div>
        </div>
    )
}
Add.Layout = Layout;

