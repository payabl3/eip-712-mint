module.exports = {
    getEIP712Signature: async function (_domain, _types, _value, _signer) {
        const signature = await _signer._signTypedData(_domain, _types, _value);
        return signature;
    },
}