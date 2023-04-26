import {createRef, useContext, useEffect} from "react";
import Link from "next/link";
import {GlobalContext} from "../../../context/GlobalContext";

export default function Layout({children}){
    const {role} = useContext(GlobalContext).user
    const btnList = useContext(GlobalContext).transactionButtons
    const trPayNowModalInfo = useContext(GlobalContext).transactionPayNowModalInfo
    const setTrPayNowModalInfo = useContext(GlobalContext).setTransactionPayNowModalInfo
    const setAddCart = useContext(GlobalContext).setAddCart
    const setId = useContext(GlobalContext).setTransactionId
    const add = createRef()
    const ret = createRef()
    const history = createRef()

    useEffect(()=> {
        if(role === 0) {
            add.current.style.display = 'none'
            ret.current.style.display = 'none'
            add.current.classList.remove('disabled')
            ret.current.classList.remove('disabled')
            history.current.classList.add('disabled')
        }else {
            add.current.style.display = 'inline-block'
            ret.current.style.display = 'inline-block'
        }
    },[role])

    useEffect(()=> {
        if (btnList && btnList.current) {
            btnList.current.add = add.current
            btnList.current.ret = ret.current
            btnList.current.history = history.current
        }
    }, [btnList])

    const toggleDisable = (e)=> {
        add.current.classList.remove('disabled')
        ret.current.classList.remove('disabled')
        history.current.classList.remove('disabled')
        e.currentTarget.classList.add('disabled')
        if(trPayNowModalInfo.isReturn) {
            setAddCart([])
            setTrPayNowModalInfo({
                isReturn: false,
                credit: 0
            })
        }else setId('TR0000000000001-A0')
    }

    return (
        <div className={'main-container'}>
            <div>
                <Link href={'/transaction/add'}>
                    <button onClick={(e)=> toggleDisable(e)} ref={add} className={'disabled'}>
                        Add
                    </button>
                </Link>
                <Link href={'/transaction/return'}>
                    <button onClick={(e)=> toggleDisable(e)} ref={ret}>
                        Return
                    </button>
                </Link>
                <Link href={'/transaction/history'}>
                    <button onClick={(e)=> toggleDisable(e)} ref={history}>
                       History
                    </button>
                </Link>
            </div>
            <div>
                {children}
            </div>
        </div>
    )
}