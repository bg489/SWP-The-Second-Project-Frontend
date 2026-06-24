const VERSION = 2;
const SIZE = VERSION * 4 + 17;
const DATA_CODEWORDS = 34;
const ERROR_CODEWORDS = 10;
const FORMAT_XOR_MASK = 0x5412;
const FORMAT_GENERATOR = 0x537;

const getBit = (value, index) => ((value >>> index) & 1) !== 0;

const appendBits = (bits, value, length) => {
    for (let i = length - 1; i >= 0; i -= 1) {
        bits.push(((value >>> i) & 1) !== 0);
    }
};

const multiply = (x, y) => {
    let result = 0;

    for (let i = 7; i >= 0; i -= 1) {
        result = (result << 1) ^ ((result >>> 7) * 0x11d);
        result ^= ((y >>> i) & 1) * x;
    }

    return result & 0xff;
};

const computeDivisor = (degree) => {
    const result = Array(degree - 1).fill(0);
    result.push(1);

    let root = 1;

    for (let i = 0; i < degree; i += 1) {
        for (let j = 0; j < result.length; j += 1) {
            result[j] = multiply(result[j], root);

            if (j + 1 < result.length) {
                result[j] ^= result[j + 1];
            }
        }

        root = multiply(root, 2);
    }

    return result;
};

const computeRemainder = (data, divisor) => {
    const result = Array(divisor.length).fill(0);

    data.forEach((byte) => {
        const factor = byte ^ result.shift();
        result.push(0);

        divisor.forEach((coefficient, index) => {
            result[index] ^= multiply(coefficient, factor);
        });
    });

    return result;
};

const getFormatBits = (mask) => {
    const data = (1 << 3) | mask;
    let remainder = data << 10;

    for (let i = 14; i >= 10; i -= 1) {
        if (((remainder >>> i) & 1) !== 0) {
            remainder ^= FORMAT_GENERATOR << (i - 10);
        }
    }

    return ((data << 10) | remainder) ^ FORMAT_XOR_MASK;
};

const shouldMask = (x, y) => (x + y) % 2 === 0;

const encodeCodewords = (value) => {
    const bytes = Array.from(new TextEncoder().encode(value));
    const bits = [];

    appendBits(bits, 0x4, 4);
    appendBits(bits, bytes.length, 8);
    bytes.forEach((byte) => appendBits(bits, byte, 8));

    const capacityBits = DATA_CODEWORDS * 8;

    if (bits.length > capacityBits) {
        throw new Error("QR_VALUE_TOO_LONG");
    }

    appendBits(bits, 0, Math.min(4, capacityBits - bits.length));

    while (bits.length % 8 !== 0) {
        bits.push(false);
    }

    const dataCodewords = [];

    for (let i = 0; i < bits.length; i += 8) {
        let byte = 0;

        for (let j = 0; j < 8; j += 1) {
            byte = (byte << 1) | (bits[i + j] ? 1 : 0);
        }

        dataCodewords.push(byte);
    }

    for (let padByte = 0xec; dataCodewords.length < DATA_CODEWORDS; padByte ^= 0xfd) {
        dataCodewords.push(padByte);
    }

    return [
        ...dataCodewords,
        ...computeRemainder(dataCodewords, computeDivisor(ERROR_CODEWORDS)),
    ];
};

export const createQrMatrix = (value) => {
    const text = String(value || "").trim();

    if (!text) {
        throw new Error("QR_VALUE_REQUIRED");
    }

    const modules = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
    const isFunction = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));

    const setFunctionModule = (x, y, isDark) => {
        modules[y][x] = isDark;
        isFunction[y][x] = true;
    };

    const drawFinder = (centerX, centerY) => {
        for (let y = -4; y <= 4; y += 1) {
            for (let x = -4; x <= 4; x += 1) {
                const moduleX = centerX + x;
                const moduleY = centerY + y;

                if (moduleX < 0 || moduleX >= SIZE || moduleY < 0 || moduleY >= SIZE) {
                    continue;
                }

                const distance = Math.max(Math.abs(x), Math.abs(y));
                setFunctionModule(moduleX, moduleY, distance !== 2 && distance !== 4);
            }
        }
    };

    const drawAlignment = (centerX, centerY) => {
        for (let y = -2; y <= 2; y += 1) {
            for (let x = -2; x <= 2; x += 1) {
                setFunctionModule(
                    centerX + x,
                    centerY + y,
                    Math.max(Math.abs(x), Math.abs(y)) !== 1
                );
            }
        }
    };

    const drawFormatBits = () => {
        const bits = getFormatBits(0);

        for (let i = 0; i <= 5; i += 1) setFunctionModule(8, i, getBit(bits, i));
        setFunctionModule(8, 7, getBit(bits, 6));
        setFunctionModule(8, 8, getBit(bits, 7));
        setFunctionModule(7, 8, getBit(bits, 8));
        for (let i = 9; i < 15; i += 1) setFunctionModule(14 - i, 8, getBit(bits, i));
        for (let i = 0; i < 8; i += 1) setFunctionModule(SIZE - 1 - i, 8, getBit(bits, i));
        for (let i = 8; i < 15; i += 1) setFunctionModule(8, SIZE - 15 + i, getBit(bits, i));
        setFunctionModule(8, SIZE - 8, true);
    };

    drawFinder(3, 3);
    drawFinder(SIZE - 4, 3);
    drawFinder(3, SIZE - 4);

    for (let i = 0; i < SIZE; i += 1) {
        if (!isFunction[6][i]) setFunctionModule(i, 6, i % 2 === 0);
        if (!isFunction[i][6]) setFunctionModule(6, i, i % 2 === 0);
    }

    drawAlignment(18, 18);
    drawFormatBits();

    const codewords = encodeCodewords(text);
    const dataBits = [];

    codewords.forEach((byte) => appendBits(dataBits, byte, 8));

    let bitIndex = 0;
    let upward = true;

    for (let right = SIZE - 1; right >= 1; right -= 2) {
        if (right === 6) right -= 1;

        for (let vertical = 0; vertical < SIZE; vertical += 1) {
            const y = upward ? SIZE - 1 - vertical : vertical;

            for (let column = 0; column < 2; column += 1) {
                const x = right - column;

                if (isFunction[y][x]) continue;

                let isDark = bitIndex < dataBits.length ? dataBits[bitIndex] : false;
                bitIndex += 1;

                if (shouldMask(x, y)) {
                    isDark = !isDark;
                }

                modules[y][x] = isDark;
            }
        }

        upward = !upward;
    }

    return modules;
};
