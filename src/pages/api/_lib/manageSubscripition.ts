import { query } from "faunadb";
import { fauna } from "../../../services/fauna";
import { stripe } from "../../../services/stripe";

export async function saveSubscription(
    subscriptionId: string,
    customerId: string,
){
    //buscar usuário no banco fo fauba com id {customerId}
    const userRef = await fauna.query(
        query.Select(
            "ref",
            query.Get(
                query.Match(
                    query.Index('user_by_stripe_customer_id'),
                    customerId
                )
            )
        )
    )

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    //salvar os dados da subscription no fauna
    const subscrptionData = {
        id:subscription.id,
        userId: userRef,
        status:subscription.status,
        price_id: subscription.items.data[0].id,
    }


    await fauna.query(
        query.Create(
            query.Collection('subscriptions'),
            {data:subscription}
        )
    )
}