import {createContext, useRef, useState} from "react";

export const GlobalContext = createContext([])

export default function globalVariable() {
    const {ipcRenderer} = require('electron')
    const [user, setUser] = useState({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 1,
        token: '',
    })
    const [ip,setIp] = useState('http://localhost:8092/api')
    const [url] = useState('http://localhost:8888')
    const [tab, setTab] = useState('TRANSACTION')

    const categories = {
        ALL: 'All',
        BAKING: 'Baking',
        BEVERAGES: 'Beverages',
        BREAD_AND_BAKERY: 'Bread and Bakery',
        CANNED_JARRED_GOODS: 'Canned/Jarred Goods',
        CONDIMENTS_AND_SPICES: 'Condiments and Spices',
        DELI: 'Deli',
        FROZEN_FOOD: 'Frozen Foods',
        HOUSEHOLD_SUPPLIES: 'Household Supplies',
        PASTA_RICE: 'Pasta/Rice',
        PERSONAL_HEALTH_CARE: 'Personal/Health Care',
        PRODUCE: 'Produce',
        SAUCES_AND_OIL: 'Sauces and Oil',
        SNACKS: 'Snacks',
        OTHER: 'Other',
    }

    // id
    const [transactionAddId, setTransactionAddId] = useState('TR0000000000001-A0')
    const [returnReportId, setReturnReportId] = useState('')
    const [transactionHistoryReportId, setTransactionHistoryReportId] = useState('')
    const [inventoryHistoryReportId, setInventoryHistoryReportId] = useState('')
    const [inventoryProductId, setInventoryProductId] = useState('')

    // layout buttons
    const transactionButtons = useRef({})
    const inventoryButtons = useRef({})

    // modal -- see _apps.js for name reference
    const modalRef = useRef({})
    const [transactionAddModalInfo, setTransactionAddModalInfo] = useState({
        id: '',
        price: 0,
        quantity: '',
    })
    const [transactionPayNowModalInfo, setTransactionPayNowModalInfo] = useState({
        isReturn: '',
        credit: 0,
        oldId: '',
        oldTotal: 0
    })
    const [returnEditModalInfo, setReturnEditModalInfo] = useState({
        id: '',
        price: 0,
        quantity: 0,
        total:0,
        discount: 0,
        currentPrice:0
    })
    const [inventoryLossModalInfo, setInventoryLossModalInfo] = useState({
        id: '',
        description: '',
        quantity: 0,
    })
    const [goodsReceiptInfo, setGoodsReceiptInfo] = useState({
        id: '',
        description: '',
        quantity: 0,
        price: 0,
        isDown: false,
        markPrice: 0,
        date: '',
    })
    const [inventoryProductInfo,setInventoryProductInfo] = useState({
        id: '',
        description: '',
        price: 0,
        piecesPerBox: 0
    })
    const [inventoryProductCategoryInfo,setInventoryProductCategoryInfo] = useState({
        id: '',
        description: '',
    })
    const [inventoryProductDiscountInfo, setInventoryProductDiscountInfo] = useState({
        quantity: 0,
        percent: 0
    })
    const [productHistoryInfo, setProductHistoryInfo] = useState([])
    const [discountHistoryInfo, setDiscountHistoryInfo] = useState([])


    // cart
    const [addCart, setAddCart] = useState([])
    const [lossCart, setLossCart] = useState([])
    const [goodsCart, setGoodsCart] = useState([])
    const [returnEditCart, setReturnEditCart] = useState([])
    const [notificationCart, setNotificationCart] = useState([])


    // other
    const [copyOfReturnItemList, setCopyOfReturnItemList] = useState([])
    const [privateCategoryList,setPrivateCategoryList] = useState([])
    const [discountList, setDiscountList] = useState([])
    const [notificationOption, setNotificationOption] = useState({
        isShow: false,
        color: 'low'
    })

    return {
        user:                               user,
        setUser:                            setUser,
        ip:                                 ip,
        setIp:                              setIp,
        url:                                url,
        ipcRenderer:                        ipcRenderer,
        modalRef:                           modalRef,
        trAddModalInfo:                     transactionAddModalInfo,
        setTrAddModalInfo:                  setTransactionAddModalInfo,
        categories:                         categories,
        tab:                                tab,
        setTab:                             setTab,
        transactionId:                      transactionAddId,
        setTransactionId:                   setTransactionAddId,
        returnReportId:                     returnReportId,
        setReturnReportId:                  setReturnReportId,
        addCart:                            addCart,
        setAddCart:                         setAddCart,
        lossCart:                           lossCart,
        setLossCart:                        setLossCart,
        goodsCart:                          goodsCart,
        setGoodsCart:                       setGoodsCart,
        returnEditModalInfo:                returnEditModalInfo,
        setReturnEditModalInfo:             setReturnEditModalInfo,
        copyOfReturnItemList:               copyOfReturnItemList,
        setCopyOfReturnItemList:            setCopyOfReturnItemList,
        transactionHistoryReportId:         transactionHistoryReportId,
        setTransactionHistoryReportId:      setTransactionHistoryReportId,
        inventoryLossModalInfo:             inventoryLossModalInfo,
        setInventoryLossModalInfo:          setInventoryLossModalInfo,
        goodsReceiptInfo:                   goodsReceiptInfo,
        setGoodsReceiptInfo:                setGoodsReceiptInfo,
        transactionButtons:                 transactionButtons,
        inventoryButtons:                   inventoryButtons,
        inventoryHistoryReportId:           inventoryHistoryReportId,
        setInventoryHistoryReportId:        setInventoryHistoryReportId,
        inventoryProductId:                 inventoryProductId,
        setInventoryProductId:              setInventoryProductId,
        inventoryProductInfo:               inventoryProductInfo,
        setInventoryProductInfo:            setInventoryProductInfo,
        inventoryProductCategoryInfo:       inventoryProductCategoryInfo,
        setInventoryProductCategoryInfo:    setInventoryProductCategoryInfo,
        privateCategoryList:                privateCategoryList,
        setPrivateCategoryList:             setPrivateCategoryList,
        discountList:                       discountList,
        setDiscountList:                    setDiscountList,
        returnEditCart:                     returnEditCart,
        setReturnEditCart:                  setReturnEditCart,
        transactionPayNowModalInfo:         transactionPayNowModalInfo,
        setTransactionPayNowModalInfo:      setTransactionPayNowModalInfo,
        inventoryProductDiscountInfo:       inventoryProductDiscountInfo,
        setInventoryProductDiscountInfo:    setInventoryProductDiscountInfo,
        productHistoryInfo:                 productHistoryInfo,
        setProductHistoryInfo:              setProductHistoryInfo,
        discountHistoryInfo:                discountHistoryInfo,
        setDiscountHistoryInfo:             setDiscountHistoryInfo,
        notificationInfo:                   notificationOption,
        setNotificationInfo:                setNotificationOption,
        notificationCart:                   notificationCart,
        setNotificationCart:                setNotificationCart,
    }
}