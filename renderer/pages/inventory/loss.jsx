import Layout from "../../components/Layout/inventory/Layout";
import {ProductTable} from "../../components/table/ProductTable";
import {useContext, useEffect, useRef, useState} from "react";
import {GlobalContext} from "../../context/GlobalContext";
import {setNavDisplay} from "../../helper/GlobalHelper";
import {useDisposeHelper} from "../../helper/DisposeHelper";
import {useLogsHelper} from "../../helper/LogsHelper";

export default function Loss() {
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const ip = useContext(GlobalContext).ip
    const {username} = useContext(GlobalContext).user
    const lossCart = useContext(GlobalContext).lossCart
    const setLossCart = useContext(GlobalContext).setLossCart
    const setLossInfo = useContext(GlobalContext).setInventoryLossModalInfo
    const lossModal = useContext(GlobalContext).modalRef.current.inventoryLoss
    const [id, setId] = useState('NP0000000000001-A0')
    const [total, setTotal] = useState(0)
    const reportBtn = useRef()
    const dispose = useDisposeHelper()
    const logAction = useLogsHelper()

    useEffect(()=> {setNavDisplay(true)},[])

    useEffect(()=> {
        if(lossCart.length > 0) reportBtn.current.classList.remove('disabled')
        else reportBtn.current.classList.add('disabled')
        let num = 0
        lossCart.forEach(item => {
            num += item.total
        })
        setTotal(num)
    },[lossCart])

    useEffect(()=> {
        const interval = setInterval(()=> {
            fetch(`${ip}/loss/generate?id=${id}`)
                .then(res => {return res.text()})
                .then(setId)
        },500)
        return ()=> clearInterval(interval)
    },[id])

    const showInventoryModal = (e,id,isEdit)=> {
        const disposeElement = e.currentTarget.querySelector('.dispose')
        if(e === '' || !disposeElement) {
            fetch(ip + `/merchandise/find-by-id?id=${id}`)
                .then((res)=> {return res.json()})
                .then(data => {
                    setLossInfo({
                        id: data.id,
                        description: data.description,
                        quantity: data.quantity,
                        isEdit: isEdit,
                        price: data.price
                    })
                    lossModal.classList.remove('hidden')
                })
        }else dispose(id)
    }

    const handleLossCartRow = (id)=> {
        ipcRenderer.invoke('open-dialog-box', {
            type: 'none',
            buttons: ['Remove', 'Edit', 'Cancel'],
            message: `What to do with ${id}?`,
            noLink: true,
            title: 'Inventory Loss Cart',
            defaultId: 2
        }).then(num => {
            if(num === 0) setLossCart(lossCart.filter(product => product.id !== id))
            else if (num === 1) showInventoryModal('',id,true)
        })
    }

    const handleSave = ()=> {
        const data = {
            itemList: setLossCartProperties(),
            report: {
                id: id,
                user: username,
                timestamp: '',
                isValid: true,
                isArchived: false,
                total: total,
                reason: 'Default',
                link: '',
            }
        }
        ipcRenderer.invoke('open-dialog-box', {
            type: 'none',
            buttons: ['Save', 'Cancel'],
            message: `Do you want to save the report ${id}?`,
            noLink: true,
            title: 'Inventory Loss',
            defaultId: 0
        }).then(num => {
            if(num === 0) {
                fetch(`${ip}/loss/save`,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }).then(res=> {return res.json()})
                    .then(data => {
                        if(data.length === 0) {
                            ipcRenderer.send('showMessage','Inventory Loss','Success...')
                            logAction('Inventory Loss','ANO ???')
                            setLossCart([])
                        } else {
                            const outOfStockItems = data.join('::')
                            ipcRenderer.send('showError','Inventory Loss',
                                `Some products does not have sufficient stock, update the cart.\n${outOfStockItems}`
                            )
                        }
                    })
            }
        })
    }

    const setLossCartProperties = ()=> {
        const arr = []
        lossCart.map(item => {
            arr.push({
                id: item.id,
                description: item.description,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
                reason: item.reason,
                reportId: id,
                link: ''
            })
        })
        return arr
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
                            <th>Reason</th>
                        </tr>
                        </thead>
                        <tbody>
                            {lossCart.map((item) => (
                                <tr key={item.id} onClick={()=> handleLossCartRow(item.id)}>
                                    <td>{item.id}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className={'product-report'}>
                        <h3>{id}</h3>
                        <div>
                            <button ref={reportBtn} onClick={handleSave}  className={'btn'}>Save</button>
                            <button onClick={()=> setLossCart([])} className={'btn'}>Clear</button>
                        </div>
                    </div>
                </div>
                <div className="right">
                    <ProductTable rowHandler={showInventoryModal}/>
                </div>
            </div>
        </>
    )
}

Loss.Layout = Layout