import argparse
import json
from datetime import datetime, timedelta
from gvm.connections import TLSConnection
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeTransform


def schedule_scan(args):
    try:
        connection = TLSConnection(hostname=args.host, port=args.port)
        transform = EtreeTransform()

        with Gmp(connection, transform=transform) as gmp:
            gmp.authenticate(args.username, args.password)

            # Create schedule
            schedule_response = gmp.create_schedule(
                name=f"Scheduled_{args.target_name}_{datetime.now().strftime('%Y%m%d%H%M')}",
                first_time=datetime.now() + timedelta(minutes=5),
                duration=timedelta(hours=args.duration),
                period=args.period,
                period_months=args.period_months,
                timezone=args.timezone
            )
            schedule_id = schedule_response.get('id')

            # Create target
            targets_response = gmp.get_targets()
            target = None
            for t in targets_response.xpath('target'):
                if t.find('name').text == args.target_name:
                    target = t
                    break

            if not target:
                target_response = gmp.create_target(
                    name=args.target_name,
                    hosts=[args.target_host],
                    port_list_id=args.port_list
                )
                target_id = target_response.get('id')
            else:
                target_id = target.get('id')

            # Create scheduled task
            task_response = gmp.create_task(
                name=f"Scheduled_Scan_{args.target_name}",
                config_id=args.scan_config,
                target_id=target_id,
                scanner_id=args.scanner_id,
                schedule_id=schedule_id
            )

            return {
                "status": "success",
                "task_id": task_response.get('id'),
                "schedule_id": schedule_id,
                "message": f"Scheduled scan created for {args.target_name}"
            }

    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Schedule GVM scan')
    parser.add_argument('--host', required=True)
    parser.add_argument('--port', type=int, default=9390)
    parser.add_argument('--username', required=True)
    parser.add_argument('--password', required=True)
    parser.add_argument('--target_name', required=True)
    parser.add_argument('--target_host', required=True)
    parser.add_argument('--scan_config', default='daba56c8-73ec-11df-a475-002264764cea')
    parser.add_argument('--scanner_id', default='08b69003-5fc2-4037-a479-93b440211c73')
    parser.add_argument('--port_list', default='4a4717fe-57d2-11e1-9a26-406186ea4fc5')
    parser.add_argument('--duration', type=int, default=2, help='Duration in hours')
    parser.add_argument('--period', type=int, default=1, help='Repeat every X days')
    parser.add_argument('--period_months', type=int, default=0, help='Repeat every X months')
    parser.add_argument('--timezone', default='UTC', help='Timezone e.g. Europe/Paris')

    args = parser.parse_args()
    result = schedule_scan(args)
    print(json.dumps(result))
