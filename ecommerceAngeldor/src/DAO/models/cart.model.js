import mongoose from "mongoose";

const cartCollection = 'carts';

const cartSchema = new mongoose.Schema({
    items:[{
        productId:{type: mongoose.Schema.Types.ObjectId, ref : 'Product'},
        title: String,
        quantity: Number
    }],
    total: {
        type: Number,
        default: 0,
        validate: {
            validator: function(value){
                return !isNaN(value)
            },
            message: props => `${props.value} no es un número válido para 'total'.`
        }
    }
});

export const cartModel = mongoose.model(cartCollection, cartSchema);