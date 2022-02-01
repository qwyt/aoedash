interface IFindProfileForStringResultsOption {

    key: string
    error?: string
    player?: { name: string, elo: string }
    // error?: string
    // name?: string
    // elo?: string
}

export interface IFindProfileForStringResults {
    possibleOptions: IFindProfileForStringResultsOption[]
}

export function FindProfileForString(searchString: string) {


    let potentialIds = searchString.split(" ")
    // let args: { "steam_id": string[], "profile_id": string[] } = {profile_id: [], steam_id: []}
    //
    //
    // for (let pId of potentialIds) {
    //     //Only digits
    //     if (/^\d+$/.test(pId)) {
    //         if (pId.length < 16) {
    //             args.profile_id.push(pId)
    //             continue;
    //         }
    //         if (pId.length > 15) {
    //             args.steam_id.push(pId)
    //             continue;
    //         }
    //
    //     }
    // }

    // https://aoe2.net/api/player/lastmatch?game=aoe2de&steam_id=76561199003184910

    let apiUrl = "https://aoe2.net/api/player/lastmatch"

    // let urlPaths: any[] = []
    //
    //
    // for (let steam_id of args.steam_id) {
    //     let url = new URL(apiUrl)
    //     url.search = new URLSearchParams({game: "aoe2de", steam_id: steam_id}).toString();
    //     urlPaths.push(url.toString())
    // }
    //
    // for (let profile_id of args.profile_id) {
    //     let url = new URL(apiUrl)
    //     url.search = new URLSearchParams({game: "aoe2de", profile_id: profile_id}).toString();
    //     urlPaths.push(url.toString())
    // }

    return Promise.all(
        potentialIds.map((pId) => {

            let url = new URL(apiUrl)
            if (/^\d+$/.test(pId)) {
               if (pId.length < 16) {
                   url.search = new URLSearchParams({game: "aoe2de", profile_id: pId}).toString();
               }
               else if (pId.length > 15) {
                    url.search = new URLSearchParams({game: "aoe2de", profile_id: pId}).toString();
                }
            }

            return fetch(url.toString())
                .then(r => r.json())
                .then((data) => {
                    return {key: data.profile_id, player: {name: data.name, elo: data.rating}}
                })
                .catch(error => {
                    return {key:pId, error: "Not Found"}
                })
        }))
}

// return new Promise<IFindProfileForStringResults>((resolve) => setTimeout(() => {
//
//     const results = await Promise.all(urls.map((url) => fetch(url).then((r: any) => r.json())
//     resolve({
//         possibleOptions: [{error: JSON.stringify(results)}]
//
//         // return {error: JSON.stringify(r)}
//     })
// }))


// return new Promise<IFindProfileForStringResults>((resolve) => setTimeout(() => {
//     resolve({
//         possibleOptions: [{error: JSON.stringify(results)}]
//
//         // return {error: JSON.stringify(r)}
//     })
// }))

// }