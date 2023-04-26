import {createRef, useContext, useEffect} from "react";
import Link from "next/link";
import {GlobalContext} from "../../../context/GlobalContext";

export default function Layout({children}){
    const btnList = useContext(GlobalContext).inventoryButtons

    const add = createRef()
    const ret = createRef()
    const history = createRef()
    const product = createRef()

    useEffect(()=> {
        if (btnList && btnList.current) {
            btnList.current.add = add.current
            btnList.current.ret = ret.current
            btnList.current.history = history.current
            btnList.current.product = product.current
        }
    }, [btnList])

    const toggleDisable = (e)=> {
        add.current.classList.remove('disabled')
        ret.current.classList.remove('disabled')
        history.current.classList.remove('disabled')
        product.current.classList.remove('disabled')
        e.currentTarget.classList.add('disabled')
    }

    return (
        <div className={'main-container'}>
            <div>
                <Link href={'/inventory/loss'}>
                    <button onClick={(e)=> toggleDisable(e)} ref={add} className={'disabled inventory-btn'}>
                        Inventory Loss
                    </button>
                </Link>
                <Link href={'/inventory/goods-receipt'}>
                    <button onClick={(e)=> toggleDisable(e)} ref={ret} className={'inventory-btn'}>
                        Goods Receipt
                    </button>
                </Link>
                <Link href={'/inventory/history'}>
                    <button onClick={(e)=> toggleDisable(e)} ref={history}>
                        History
                    </button>
                </Link>
                <Link href={'/inventory/product'}>
                    <button onClick={(e)=> toggleDisable(e)} ref={product}>
                        Product
                    </button>
                </Link>
            </div>
            <div>
                {children}
            </div>
        </div>
    )
}