import './css/styles.css'
import Head from "next/head";
import globalVariable, {GlobalContext} from "../context/GlobalContext";
import Link from "next/link";
import {useContext, useEffect, useRef} from "react";
import {TransactionAddModal} from "../components/modal/TransactionAddModal";
import {TransactionPayNowModal} from "../components/modal/TransactionPayNowModal";
import {ReturnEditModal} from "../components/modal/ReturnEditModal";
import {InventoryLossModal} from "../components/modal/InventoryLossModal";
import {GoodsReceiptModal} from "../components/modal/GoodsReceiptModal";
import {ProductUpdateModal} from "../components/modal/ProductUpdateModal";
import {ProductCategoryModal} from "../components/modal/ProductCategoryModal";
import {ProductDiscountModal} from "../components/modal/ProductDiscountModal";
import {ProductHistoryModal} from "../components/modal/ProductHistoryModal";
import {ProductAddModal} from "../components/modal/ProductAddModal";
import {NotificationModal} from "../components/modal/NotificationModal";
import {SettingsModal} from "../components/modal/SettingsModal";
import {ChangeIpModal} from "../components/modal/ChangeIpModal";
import {validateIP} from "../helper/GlobalHelper";
import fs from 'fs'

export default function MyApp({ Component, pageProps }) {
    const Layout = Component.Layout || EmptyLayout;
    const global = globalVariable()
    const sidebar = useRef()
    const sidebarBody = useRef()
    const clock = useRef()
    const inventory = useRef()
    const report = useRef()
    const {username}  = global.user
    const filename = 'ip-config.txt'
    const ip = useContext(GlobalContext).ip

    useEffect(()=> {
        fs.access('ip-config.txt', fs.constants.F_OK, (err) => {
            if (err) {
                createFile()
                console.log('CANT')
            }
            else {
                fs.readFile(filename, 'utf8', (err, data) => {
                    if (err) {
                        console.error(err)
                        return
                    }
                    const ip = JSON.parse(data).ip
                    if(ip === '' || validateIP(ip)) global.setIp(`http://${ip}:8092/api`)
                    else {
                        createFile()
                        global.setIp(`http://192.168.1.100:8092/api`)
                    }
                })
            }
        })
    },[ip])

    useEffect(()=> {
        if(global.user.role === 1) {
            inventory.current.style.display = 'none'
            report.current.style.display = 'none'
        }else {
            inventory.current.style.display = 'inline-block'
            report.current.style.display = 'inline-block'
        }
    },[global.user.role])

    useEffect(()=> {
        const interval = setInterval(()=> {
            const res = fetch(global.ip + '/date/get-time')
                    .then((r)=> {return r.text()})
                    .catch(console.log)
            res.then((time)=> {
                clock.current.textContent = time ? time : '23:59:59'
            })
        },1000)
        return ()=> clearInterval(interval)
    },[])

    const createFile = ()=> {
        fs.writeFile(filename, JSON.stringify({ip: '192.168.1.100' }), (err) => {
            if (err) {
                console.error(err)
                return
            }
            console.log('Data has been written to file')
        })
    }

    const handleSidebar = () => {
        sidebar.current.classList.toggle('active')
        sidebarBody.current.classList.toggle('active')
    }

    const handleTransactionReturn = ()=> {
        if(global.transactionPayNowModalInfo.isReturn) {
            global.setAddCart([])
            global.setTransactionPayNowModalInfo({
                isReturn: false,
                credit: 0
            })
        }
    }

    return (
        <>
            <Head>
                <title>HLC Grocery</title>
            </Head>
            <GlobalContext.Provider value={global}>
                <ChangeIpModal
                    ref={ref => global.modalRef.current.ipModal = ref}
                />
                <TransactionAddModal
                    ref={ref => global.modalRef.current.transactionAdd = ref}
                    productId={global.trAddModalInfo.id}
                    price={global.trAddModalInfo.price}
                    description={global.trAddModalInfo.description}
                    isReturn={global.trAddModalInfo.isReturn}
                />
                <TransactionPayNowModal
                    ref={ref => global.modalRef.current.transactionPayNow = ref}
                    isReturn={global.transactionPayNowModalInfo.isReturn}
                    credit={global.transactionPayNowModalInfo.credit}
                    oldId={global.transactionPayNowModalInfo.oldId}
                    oldTotal={global.transactionPayNowModalInfo.oldTotal}
                />
                <ReturnEditModal
                    ref={ref => global.modalRef.current.transactionReturnEdit = ref}
                    id={global.returnEditModalInfo.id}
                    price={global.returnEditModalInfo.price}
                    quantity={global.returnEditModalInfo.quantity}
                    total={global.returnEditModalInfo.total}
                    discount={global.returnEditModalInfo.discount}
                    currentPrice={global.returnEditModalInfo.currentPrice}
                    description={global.returnEditModalInfo.description}
                />
                <InventoryLossModal
                    ref={ref => global.modalRef.current.inventoryLoss = ref}
                    id={global.inventoryLossModalInfo.id}
                    description={global.inventoryLossModalInfo.description}
                    quantity={global.inventoryLossModalInfo.quantity}
                    price={global.inventoryLossModalInfo.price}
                    isEdit={global.inventoryLossModalInfo.isEdit}
                />
                <GoodsReceiptModal
                    ref={ref => global.modalRef.current.goodsReceipt = ref}
                    id={global.goodsReceiptInfo.id}
                    description={global.goodsReceiptInfo.description}
                    price={global.goodsReceiptInfo.price}
                    quantity={global.goodsReceiptInfo.quantity}
                    isEdit={global.goodsReceiptInfo.isEdit}
                    markPrice={global.goodsReceiptInfo.markPrice}
                    initDate={global.goodsReceiptInfo.date}
                    initIsDown={global.goodsReceiptInfo.isMarkUp}
                />
                <ProductUpdateModal
                    ref={ref => global.modalRef.current.productUpdate = ref}
                    id={global.inventoryProductInfo.id}
                    description={global.inventoryProductInfo.description}
                    quantity={global.inventoryProductInfo.quantity}
                    piecesPerBox={global.inventoryProductInfo.piecesPerBox}
                    price={global.inventoryProductInfo.price}
                />
                <ProductCategoryModal
                    ref={ref => global.modalRef.current.productCategory = ref}
                    id={global.inventoryProductCategoryInfo.id}
                    description={global.inventoryProductCategoryInfo.description}
                />
                <ProductDiscountModal
                    ref={ref => global.modalRef.current.productDiscount = ref}
                    id={global.inventoryProductCategoryInfo.id}
                    description={global.inventoryProductCategoryInfo.description}
                />
                <ProductHistoryModal
                    ref={ref => global.modalRef.current.productHistory = ref}
                    id={global.inventoryProductCategoryInfo.id}
                    description={global.inventoryProductCategoryInfo.description}
                />
                <ProductAddModal
                    ref={ref => global.modalRef.current.productAdd = ref}
                />
                <NotificationModal
                    ref={ref => global.modalRef.current.notification = ref}
                />
                <SettingsModal
                    ref={ref => global.modalRef.current.settings = ref}
                />
                <nav>
                    <div>
                        <div ref={sidebar} onClick={handleSidebar}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <h1>{username}</h1>
                        <div ref={sidebarBody} className={'active'}>
                            <h1 onClick={()=> {
                                handleSidebar()
                                handleTransactionReturn()
                            }}>
                                <Link href={'/dashboard'}>Dashboard</Link>
                            </h1>
                                <Link href={global.user.role === 1 ? '/transaction/add' : '/transaction/history'}>
                                    <h1 onClick={()=> {
                                        handleSidebar(sidebar)
                                        handleTransactionReturn()
                                        global.setTab('TRANSACTION')
                                        if(global.user.role === 1) {
                                            global.transactionButtons.current.add?.classList.add('disabled')
                                            global.transactionButtons.current.history?.classList.remove('disabled')
                                        }else {
                                            global.transactionButtons.current.add?.classList.remove('disabled')
                                            global.transactionButtons.current.history?.classList.add('disabled')
                                        }
                                        global.transactionButtons.current.ret?.classList.remove('disabled')

                                    }}>Transaction</h1>
                                </Link>
                                <Link href={'/inventory/loss'}>
                                    <h1 ref={inventory} onClick={()=> {
                                        handleSidebar()
                                        handleTransactionReturn()
                                        global.setTab('INVENTORY')
                                        global.inventoryButtons.current.add?.classList.add('disabled')
                                        global.inventoryButtons.current.ret?.classList.remove('disabled')
                                        global.inventoryButtons.current.history?.classList.remove('disabled')
                                        global.inventoryButtons.current.product?.classList.remove('disabled')
                                    }}>Inventory</h1>
                                </Link>
                            <h1 ref={report} onClick={()=> {
                                handleSidebar()
                                handleTransactionReturn()
                                global.setTab('REPORT')
                            }}>
                                <Link href={'/report/generate'}>Report</Link>
                            </h1>
                            <h1 onClick={()=> {
                                handleSidebar(sidebar)
                                handleTransactionReturn()
                                global.setTab('LOGS')
                            }}>
                                <Link href={'/logs/show'}>Logs</Link>
                            </h1>
                            <h1 onClick={()=> {
                                handleSidebar()
                                handleTransactionReturn()
                            }}>
                                <Link href={'/home'}>Logout</Link>
                            </h1>
                        </div>
                    </div>
                    <div>
                        <img src="/images/logo.png" alt={'logo'}/>
                        <h1 id={'tab'}>{global.tab}</h1>
                    </div>
                    <h1 ref={clock}>23:59:59</h1>
                </nav>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </GlobalContext.Provider>
        </>
    );
}

const EmptyLayout = ({children})=> <>{children}</>