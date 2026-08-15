import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GiftPointsBalance, GiftPointsRedemption } from '../models/gift-points.model';

@Injectable({
  providedIn: 'root'
})
export class GiftPointsService {
  private http = inject(HttpClient);
  private balanceUrl = '/api/giftPointsBalances';
  private redeemUrl = '/api/gift-points/redeem';

  getGiftPointsBalance(userId: string): Observable<GiftPointsBalance[]> {
    return this.http.get<GiftPointsBalance[]>(`${this.balanceUrl}?userId=${userId}`);
  }

  redeemGiftPoints(redemption: GiftPointsRedemption): Observable<{ success: boolean; newBalance: number }> {
    return this.http.post<{ success: boolean; newBalance: number }>(this.redeemUrl, redemption);
  }
}
