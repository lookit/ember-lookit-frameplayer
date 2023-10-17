const addSearchParams = function(exitUrl, responseId, hashChildId){
    try {
        // Parse URL and search params
        const url = new URL(exitUrl);

        // Set child and response values
        url.searchParams.set('child', hashChildId);
        url.searchParams.set('response', responseId);

        // Return updated URL
        return url.toString();

    } catch (TypeError) {
        // If the provided URL can't be parsed, return root.
        console.error(TypeError.message)
        return '/'
    }
};

export { addSearchParams };
