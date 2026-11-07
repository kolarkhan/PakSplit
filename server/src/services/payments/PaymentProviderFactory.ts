import { AppError } from '../../utils/AppError';

import { EasyPaisaProvider } from './providers/EasyPaisaProvider';
import { JazzCashProvider } from './providers/JazzCashProvider';
import { ManualSettlementProvider } from './providers/ManualSettlementProvider';
import { RaastProvider } from './providers/RaastProvider';

export class PaymentProviderFactory {
  static create(method: string) {
    switch (method) {
      case 'easypaisa':
        return new EasyPaisaProvider();
      case 'jazzcash':
        return new JazzCashProvider();
      case 'raast':
      case 'bank':
        return new RaastProvider();
      case 'cash':
        return new ManualSettlementProvider();
      default:
        throw new AppError(`Unsupported payment provider: ${method}`, 400);
    }
  }
}
