export const propToPercent = (prop: number, decimals?: number) => {
    let _dec = decimals !== undefined ? decimals : 2;
    let mult = Number("100" + "0".repeat(_dec))
    let div = Number("1" + "0".repeat(_dec))
    return Math.round(prop * mult) / div
}
export const roundToDec = (value: number, dec?: number) => {

    let _dec = dec !== undefined ? dec : 2;
    let mult = Number("1" + "0".repeat(_dec))

    return Math.round(value * mult) / _dec
}

export function GetObjOrMapKeys(target: Object | Map<string, any>){

    if (target instanceof Map){
       return Array.from(target.keys())
    }
    else {
        return Object.keys(target)
    }
}