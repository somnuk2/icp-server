// Global error handler middleware
export function errorHandler(err, req, res, next) {
    console.error('❌ Error:', err.message)
    console.error(err.stack)

    // MySQL errors
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Duplicate entry. Record already exists.' })
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ error: 'Referenced record does not exist.' })
    }

    // Default
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    })
}


