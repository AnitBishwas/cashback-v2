/**
 * Format number into money
 * @param {Number} amount 
 * @returns currency formatted number
 */
const moneyFormatter = (amount) =>{
    const formatter = new Intl.NumberFormat('en-IN',{
        currency: 'INR',
        maximumFractionDigits:0,
        style: 'currency'
    });
    return formatter.format(amount);
};

export {moneyFormatter};