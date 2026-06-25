<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>予約確認</title>
</head>
<body style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>予約確認のご案内</h2>

    <p>{{ $reservation->user->name }} 様</p>
    <p>以下の内容でご予約を承りました。</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="border-bottom: 1px solid #ddd;">
            <th style="text-align: left; padding: 8px;">開始日時</th>
            <td style="padding: 8px;">{{ $reservation->start_datetime->format('Y年m月d日 H:i') }}</td>
        </tr>
        <tr style="border-bottom: 1px solid #ddd;">
            <th style="text-align: left; padding: 8px;">終了日時</th>
            <td style="padding: 8px;">{{ $reservation->end_datetime->format('Y年m月d日 H:i') }}</td>
        </tr>
        <tr style="border-bottom: 1px solid #ddd;">
            <th style="text-align: left; padding: 8px;">ご利用時間</th>
            <td style="padding: 8px;">{{ $reservation->hours }}時間</td>
        </tr>
        <tr>
            <th style="text-align: left; padding: 8px;">料金</th>
            <td style="padding: 8px;">¥{{ number_format($reservation->total_price) }}</td>
        </tr>
    </table>

    <p>ご不明な点はお電話にてお問い合わせください。</p>
    <p>ご利用をお待ちしております。</p>
</body>
</html>
