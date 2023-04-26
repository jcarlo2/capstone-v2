import {useContext} from "react";
import {GlobalContext} from "../context/GlobalContext";

export const useLogsHelper = ()=> {
    const ip = useContext(GlobalContext).ip
    const {username} = useContext(GlobalContext).user
    return (action,description) => {
        fetch(`${ip}/logs/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                no: '',
                user: username,
                action: action,
                description: description,
                timestamp: '',
            })
        }).then(console.log)
    }
}