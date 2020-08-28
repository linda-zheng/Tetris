class Events {
    constructor() {
        this.listeners = new Set;
    }

    // add event
    listen(name, callback) {
        this.listeners.add({name: name, callback: callback});
    }

    // call the callback with the data
    emit(name, ...data) {
        this.listeners.forEach(listener => {
            if (listener.name === name) {
                listener.callback(...data); 
                // equivalent to data[0], data[1], data[2]
            }
        })
    }
}