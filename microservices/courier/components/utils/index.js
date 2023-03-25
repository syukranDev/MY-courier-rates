function prepareResponse(code, text, data) {
	return ({
		code: code,
		text: text,
		data: data
	})
};

module.exports = {
    prepareResponse : prepareResponse
}