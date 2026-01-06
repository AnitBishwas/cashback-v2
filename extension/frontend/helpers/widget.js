const getWidgetData = async () => {
    try {
        const url = `/apps/cashback-v2/widget`;
        const req = await fetch(url);
        const data = await req.json();
        return data;
    } catch (err) {
        throw new Error("Failed to get widget data reason -->" + err.message);
    }
};
const getCartData = async () => {
    try {
        const req = await fetch("/cart.js");
        const data = await req.json();
        return data;
    } catch (err) {

    }
}
export { getWidgetData, getCartData };