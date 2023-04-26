import React, {memo, useContext, useEffect, useState} from 'react';
import {divide, fixNumber} from "../../helper/GlobalHelper";
import {GlobalContext} from "../../context/GlobalContext";

export const ProductTableRow = memo(({data, onClickHandler})=> {
    const cart = useContext(GlobalContext).notificationCart
    const [disposeList, setDisposeList] = useState([])
    useEffect(()=> {
        setDisposeList(cart.filter(item => item.color === 'dispose'))
    },[cart])
    return (
        <>
            {data.map((product) => (
                <tr key={product.id} id={product.id} onClick={(e)=> onClickHandler(e,product.id)}>
                    <td className={
                        disposeList.some(item => item.id === product.id && item.color === 'dispose')
                        ? 'dispose'
                        : product.quantity <= divide(product.piecesPerBox,2)
                            ? 'critical'
                            : product.quantity <= product.piecesPerBox
                                ? 'low'
                                : ''
                    } title={product.id}>{product.id}</td>
                    <td title={product.description}>{
                        product.description.length > 35 ? product.description.substring(0,32) + '...' : product.description
                    }</td>
                    <td title={`\u20B1 ${fixNumber(product.price)}`}>&#8369; {fixNumber(product.price)}</td>
                    <td title={product.quantity}>{parseInt(product.quantity).toLocaleString()}</td>
                </tr>
            ))}
        </>
    )
})
