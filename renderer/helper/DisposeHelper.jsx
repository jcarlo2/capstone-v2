import {useContext} from "react";
import {GlobalContext} from "../context/GlobalContext";
import {useLogsHelper} from "./LogsHelper";

export const useDisposeHelper = ()=> {
    const ip = useContext(GlobalContext).ip
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const logAction = useLogsHelper()
    return (id)=> {
        ipcRenderer.invoke('open-dialog-box', {
            type: 'none',
            buttons: ['Dispose', 'Cancel'],
            message: `Dispose expired stocks of ${id}?`,
            noLink: true,
            title: 'Product Dispose',
            defaultId: 0
        }).then(num => {
            if(num === 0) {
                fetch(`${ip}/merchandise/dispose?id=${id}`)
                    .then(()=> {
                        ipcRenderer.send('showMessage','Dispose','Product successfully dispose ...')
                        logAction('Product Dispose',`${id} was disposed properly. Always Check Notification.`)
                    })
            }
        })

    }
}