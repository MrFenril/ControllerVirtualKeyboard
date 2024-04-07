const triggersMapping = {
    7 : "R2",
    6 : "L2",
    5 : "R1",
    4 : "L1"
}

const buttonMapping = {
    0: "X",
    1: "⚪",
    2: "△",
    4: "□"
}

const arrowsMapping = {
    12: "up",
    13: "down",
    14: "left",
    15: "right",
}

const stickMapping = {
    10: "left stick",
    11: "right stick"
}

const inputMapping = {
    ...buttonMapping,
    ...triggersMapping,
    ...arrowsMapping,
    ...stickMapping
}