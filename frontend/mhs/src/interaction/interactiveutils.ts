// import { isNotDefined, isDefined } from "react-financial-charts/lib";

import { head, isDefined, isNotDefined, mapObject, GenericComponent, getMouseCanvas } from "@react-financial-charts/core";

/*export function saveInteractiveNode(chartId: any) {
    return (node: any) => {
        this[`node_${chartId}`] = node;
    };
}*/

// export function handleSelection(type: any, chartId: any) {
//     return selectionArray => {
//         const key = `${type}_${chartId}`;
//         const interactive = this.state[key].map((each, idx) => {
//             return {
//                 ...each,
//                 selected: selectionArray[idx]
//             };
//         });
//         this.setState({
//             [key]: interactive
//         });
//     };
// }


let interactiveNodes : any = []

export function saveInteractiveNodes(type: any, chartId: any) {
    // console.log({type})
    return (node:any) => {
        // console.log({node})
        if (isNotDefined(interactiveNodes)) {
            interactiveNodes = {};
        }
        const key = `${type}_${chartId}`;
        if (isDefined(node) || isDefined(interactiveNodes[key])) {
            // console.error(node, key)
            // console.log(this.interactiveNodes)
            interactiveNodes = {
                ...interactiveNodes,
                [key]: { type, chartId, node },
            };
            // console.log({interactiveNodes})
        }
    };
}
//
export function getInteractiveNodes() {
    return [];
}

/*
export function saveInteractiveNodes(type: any, chartId: any) {
    return null;
}*/
