export const setNavDisplay = (show)=> {
    document.querySelector('nav').style.display = show ? 'flex' : 'none'
}

export const fixNumber = (num)=> {
    return Number(num).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})
}

export const isValidNumber = (num)=> {
    return Number.isInteger(num) && num > 0;
}

export const multiply = (a, b)=> {
    if(a === '') a = 0
    if(b === '') b = 0
    return parseFloat(a) * parseFloat(b)
}

export const divide = (a, b)=> {
    if(a === '') a = 0
    if(b === '') b = 0
    return parseFloat(a) / parseFloat(b)
}

export const subtract = (a, b)=> {
    if(a === '') a = 0
    if(b === '') b = 0
    return parseFloat(a) - parseFloat(b)
}

export const add = (a, b)=> {
    if(a === '') a = 0
    if(b === '') b = 0
    return parseFloat(a) + parseFloat(b)
}

export const addAll = (arrObj, prop)=> {
    let total = 0
    arrObj.forEach(obj => {
        total = add(total, obj[`${prop}`])
    })
    return total
}

export const capitalizeWords = (str)=> {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export const replaceSpaceAndSlash = (str,replace)=> {
    return str.replace(/[\s/]/g, replace)
}

export const toggleDropdownList = (listRef)=> {
    if(listRef.classList.contains('active')) listRef.classList.remove('active')
    else listRef.classList.add('active')
}

export const dropdownClickHandler = (e)=> {
    if(
        !e.target.classList.contains('dropdown') &&
        !e.target.classList.contains('dropdown-list') &&
        !e.target.classList.contains('dropdown-btn')
    ) {
        const list = document.querySelectorAll('.dropdown-list')
        list.forEach(dropList => dropList.classList.remove('active'))
    }
}

export const handleScroll = (e,setOption)=> {
    const element = e.target;
    const { scrollTop, scrollHeight, clientHeight } = element;
    const isNearEnd = scrollHeight - (scrollTop + clientHeight) < 100;
    if (isNearEnd) {
        setOption(prevState => ({
            ...prevState,
                size: prevState.size < 99999999 ? Math.floor(prevState.size + 100) : prevState.size
        }))
    }
}

export const validateIP = (ip)=> {
    const ipPattern = /^([01]?\d{1,2}|2[0-4]\d|25[0-5])\.([01]?\d{1,2}|2[0-4]\d|25[0-5])\.([01]?\d{1,2}|2[0-4]\d|25[0-5])\.([01]?\d{1,2}|2[0-4]\d|25[0-5])$/;
    if (!ipPattern.test(ip)) return false
    return true
}


