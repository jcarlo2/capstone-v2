import {fixNumber} from "../../helper/GlobalHelper";
import React, {useContext} from "react";
import {GlobalContext} from "../../context/GlobalContext";

export const ReportItemsTableRow  = ()=> {
    const data = useContext(GlobalContext).addCart
    return (
        <>
            {data.map((product) => (
                <tr key={product.id}
                    id={product.id}>
                    <td>{product.id}</td>
                    <td title={product.description}>
                        {product.description.length > 25
                            ? product.description.substring(0,23) + '...'
                            : product.description}
                    </td>
                    <td>&#8369; {fixNumber(product.price)}</td>
                    <td>{parseInt(product.quantity).toLocaleString()}</td>
                    <td>{product.discount} %</td>
                    <td>&#8369; {fixNumber(product.total)}</td>
                </tr>
            ))}
        </>
    )
}