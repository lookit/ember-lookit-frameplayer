const addSearchParams = function(exitUrl, responseId, hashChildId){
    try {
        // Parse URL and search params
        const url = new URL(exitUrl);
        const params = new URLSearchParams(url.search);

        // Set child and response values
        // params.set('child', this.get('session.hash_child_id'));
        // params.set('response', this.get('session.id'))
        params.set('child', hashChildId);
        params.set('response', responseId);

        // Set these changes to the URL 
        url.search = params;

        // Return updated URL
        return url.toString();

    } catch (TypeError) {
        // If the provided URL can't be parsed, return root.
        return '/'
    }
};

export { addSearchParams };
