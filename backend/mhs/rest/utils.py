# utils.py
import hashlib
import json
from datetime import datetime, timedelta
import pytz
from flask import request

def generate_cache_key(prefix, *args):
    key = json.dumps(args, sort_keys=True)
    cache_key = f"{prefix}_{hashlib.md5(key.encode('utf-8')).hexdigest()}"
    return cache_key

def normalize_dates(from_timestamp, to_timestamp, timeframe):
    from_date = datetime.utcfromtimestamp(from_timestamp)
    to_date = datetime.utcfromtimestamp(to_timestamp)

    normalization_rules = {
        '1M': lambda dt: dt.replace(second=0, microsecond=0, minute=(dt.minute // 5) * 5),
        '5M': lambda dt: dt.replace(second=0, microsecond=0),
        '15M': lambda dt: dt.replace(second=0, microsecond=0, minute=(dt.minute // 15) * 15),
        '30M': lambda dt: dt.replace(second=0, microsecond=0, minute=(dt.minute // 30) * 30),
        '1H': lambda dt: dt.replace(minute=0, second=0, microsecond=0),
        'D': lambda dt: dt.replace(hour=0, minute=0, second=0, microsecond=0),
        'W': lambda dt: (dt - timedelta(days=dt.weekday())).replace(hour=0, minute=0, second=0, microsecond=0),
        'M': lambda dt: dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    }

    from_date = normalization_rules[timeframe](from_date)
    to_date = normalization_rules[timeframe](to_date)

    return int(from_date.timestamp()), int(to_date.timestamp())

def convert_to_utc(date_string, timezone='US/Eastern'):
    local = pytz.timezone(timezone)
    naive = datetime.strptime(date_string, '%Y-%m-%d %H:%M:%S')
    local_dt = local.localize(naive, is_dst=None)
    utc_dt = local_dt.astimezone(pytz.utc)
    return utc_dt.strftime('%Y-%m-%d %H:%M:%S')

def convert_timestamp_to_date(timestamp):
    return datetime.fromtimestamp(int(timestamp)).strftime('%Y-%m-%d')
