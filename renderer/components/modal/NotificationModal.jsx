import {forwardRef, useContext, useEffect, useState} from "react";
import {GlobalContext} from "../../context/GlobalContext";

export const NotificationModal = forwardRef(({},ref)=> {
    const ip = useContext(GlobalContext).ip
    const cart = useContext(GlobalContext).notificationCart
    const setCart = useContext(GlobalContext).setNotificationCart

    useEffect(()=> {
        const interval = setInterval(()=> {
            fetch(`${ip}/merchandise/notification`)
                .then(res => {return res.json()})
                .then(setCart)
        },3000)
        return ()=> clearInterval(interval)
    },[])

    return (
        <div className="modal-bg hidden" ref={ref}
            onClick={(e)=> {
                if(e.target === e.currentTarget) {
                    e.currentTarget.classList.add('hidden')
                }
            }}
        >
            <div className="modal-container modal-h-lg modal-xl">
                <div className="modal-body">
                    <table className={'logs-table notification-table'}>
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Description</th>
                                <th>Qty</th>
                                <th>Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            cart.map(item => (
                                <tr key={item.key}>
                                    <td className={item.color}>{item.id.length > 20 ? item.id.substring(0,20) + '...' : item.id}</td>
                                    <td className={item.color}>{item.description.length > 30 ? item.description.substring(0,27) + '...' : item.description}</td>
                                    <td className={item.color}>{item.quantity.toLocaleString()}</td>
                                    <td className={item.color}>{item.reason}</td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
})