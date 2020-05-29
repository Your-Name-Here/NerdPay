const Status = {
    COMPLETE: 1,
    INCOMPLETE: 0,
};
Object.freeze(Status);

class Order {
    constructor({id = null, items = [], user_id = null} = {id: null, items:[], user_id: null}) {
        this.id = id;
        this.status = Status.INCOMPLETE;
        this.user_id = user_id;
        this.items = items;
    }
    updateStatus(status) { this.status = status; }
    addItem(item) { this.items.push(item); }
    removeItem(item) { /* TODO */ }
    isComplete() { return this.status === Status.COMPLETE; }
    toJSON() { return JSON.stringify({ id: this.id, status: this.status, user_id: this.user_id, items: this.items }); }
    save() { /* TODO */ }
}
exports.Order = Order;
exports.Status = Status;