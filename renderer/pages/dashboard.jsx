import {createRef, useContext, useEffect, useState} from "react";
import Link from "next/link";
import {GlobalContext} from "../context/GlobalContext";
import {setNavDisplay} from "../helper/GlobalHelper";

const Dashboard = ()=> {
    const {firstName, lastName, role, username} = useContext(GlobalContext).user
    const setTab = useContext(GlobalContext).setTab
    const trPayNowModalInfo = useContext(GlobalContext).transactionPayNowModalInfo
    const setTrPayNowModalInfo = useContext(GlobalContext).setTransactionPayNowModalInfo
    const settingsModal = useContext(GlobalContext).modalRef.current.settings
    const setAddCart = useContext(GlobalContext).setAddCart
    const setTransactionId = useContext(GlobalContext).setTransactionId
    const [id, setId] = useState('')
    const inventory = createRef()
    const report = createRef()

    useEffect(()=> {
        setNavDisplay(false)
        setId(username)
    },[])

    useEffect(()=> {
        if(role === 1) {
            inventory.current.style.display = 'none'
            report.current.style.display = 'none'
        }else {
            inventory.current.style.display = 'flex'
            report.current.style.display = 'flex'
        }
    },[role])

    const handleIsReturn = ()=> {
        if(trPayNowModalInfo.isReturn) {
            setAddCart([])
            setTrPayNowModalInfo({
                isReturn: false,
                credit: 0
            })
        }else setTransactionId('TR0000000000001-A0')
    }

    return (
        <div className={'dashboard-container'}>
            <div>
                <img src="/images/setting.svg" alt="setting"
                     onClick={()=> {
                         settingsModal.classList.remove('hidden')
                     }}
                />
            </div>
            <div>
                <img src="/images/logo-text.png" alt="logo-text"/>
                <h1>{id}</h1>
                <h1>
                    {firstName === 'admin' && lastName === 'admin' ?
                        'Administrator' : `${firstName}, ${lastName}`}
                </h1>
            </div>
            <div>
                <Link href={role === 1 ? '/transaction/add' : '/transaction/history'}>
                    <div onClick={()=> {
                        setTab('TRANSACTION')
                        handleIsReturn()
                    }}>
                        <button></button>
                        <h2>TRANSACTION</h2>
                    </div>
                </Link>
                <Link href={'/inventory/loss'}>
                    <div onClick={()=> {
                        setTab('INVENTORY')
                        handleIsReturn()
                    }} ref={inventory}>
                        <button></button>
                        <h2>INVENTORY</h2>
                    </div>
                </Link>
                <Link href={'/report/generate'}>
                    <div onClick={()=> {
                        setTab('REPORT')
                        handleIsReturn()
                    }} ref={report}>
                        <button></button>
                        <h2>REPORT</h2>
                    </div>
                </Link>
                <Link href={'/logs/show'}>
                    <div onClick={()=> {
                        setTab('LOGS')
                        handleIsReturn()
                    }}>
                        <button></button>
                        <h2>LOGS</h2>
                    </div>
                </Link>
            </div>
        </div>
    )
}

export default Dashboard