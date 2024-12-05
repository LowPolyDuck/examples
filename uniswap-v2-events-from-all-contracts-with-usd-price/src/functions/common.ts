import {
  EventHandlerInput,
  blockchain,
  database,
  integrations,
} from 'flair-sdk'

interface FetchUsdPriceParams {
  event: EventHandlerInput
  token: string
  amount: number
}

export async function fetchUsdPrice({
  event,
  token,
  amount,
}: FetchUsdPriceParams): Promise<number | null> {
  if (!token || !amount) return null;

  // Hardcoded token prices (addresses should be lowercase)
  const ASSUMED_PRICES = {
    "0x3cf96ad9218e639b63cabb64772339aa20a45d88": 1.0, // Example: USDC price
    "0xa460f83cdd9584e4bd6a9838abb0bac58eade999": 1800.0, // Example: ETH price
  };

  // Check if we have a hardcoded price for this token
  const assumedPrice = ASSUMED_PRICES[token.toLowerCase()];
  if (assumedPrice !== undefined) {
    // Convert amount to decimal and multiply by assumed price
    return (Number(amount) / (10 ** 18)) * assumedPrice;
  }

  // Fallback to integration price feed
  const price = await integrations.prices.getUsdAmountByAddress({
    chainId: event.chainId,
    tokenAddress: token,
    tokenAmount: amount,
    idealBlockNumber: event.blockNumber,
    idealTimestamp: event.blockTimestamp,
  });

  return price ? price.amountUsd : null;
}

export function getISOWeekNumber(date) {
  const tempDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNumber = (tempDate.getUTCDay() + 6) % 7;
  tempDate.setUTCDate(tempDate.getUTCDate() - dayNumber + 3);
  const firstThursday = tempDate.getTime();
  tempDate.setUTCMonth(0, 1);

  if (tempDate.getUTCDay() !== 4) {
    tempDate.setUTCMonth(0, 1 + ((4 - tempDate.getUTCDay() + 7) % 7));
  }

  return (
    1 +
    Math.ceil((firstThursday - tempDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
  );
}

console.log({
  level: 'info',
  message: 'Processing event',
  tags: { ProcessorId: 'factory-tracker' }
});

