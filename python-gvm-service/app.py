from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from gvm.connections import TLSConnection
from gvm.protocols.gmp import Gmp
from lxml import etree
from icalendar import Calendar, Event
from datetime import datetime
from typing import Any, Dict
import pytz
import os

def element_to_dict(element: etree._Element) -> Dict[str, Any]:
    """Recursively converts an XML element into a dictionary, handling repeated tags."""
    result = {}
    for child in element:
        child_dict = element_to_dict(child) if len(child) else child.text
        if child.tag in result:
            if not isinstance(result[child.tag], list):
                result[child.tag] = [result[child.tag]]
            result[child.tag].append(child_dict)
        else:
            result[child.tag] = child_dict
    result.update(element.attrib)
    return result

# Configuration
GVM_HOST = "192.168.0.233"
GVM_PORT = 9390
gvmUsername = "admin"
gvmPassword = "admin"

app = FastAPI()

class TargetRequest(BaseModel):
    name: str
    hosts: list[str]
    port_list_id: Optional[str] = "4a4717fe-57d2-11e1-9a26-406186ea4fc5"

class ScheduleRequest(BaseModel):
    name: str
    time: str  # Format: YYYYMMDDTHHMMSSZ (UTC)
    period: Optional[str] = "FREQ=DAILY"
    timezone: Optional[str] = "UTC"
    until: Optional[str] = None  # Format: YYYYMMDDTHHMMSSZ (UTC)

class TaskRequest(BaseModel):
    name: str
    target_id: str
    config_id: Optional[str] = "daba56c8-73ec-11df-a475-002264764cea"
    schedule_id: Optional[str] = None
    scanner_id: Optional[str] ="08b69003-5fc2-4037-a479-93b440211c73"
    

def connect_to_gvm():
    connection = TLSConnection(
        hostname=GVM_HOST,
        port=GVM_PORT,
    )
    return Gmp(connection)

# ---------------------- TARGET ----------------------

@app.post("/targets")
def create_target(request: TargetRequest):
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            response = gmp.create_target(
                name=request.name,
                hosts=request.hosts,
                port_list_id=request.port_list_id
            )
            root = etree.fromstring(response)
            if root is None:
                raise HTTPException(status_code=404, detail="Target not found")
            return element_to_dict(root)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/targets")
def get_all_targets():
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            response = gmp.get_targets()
            root = etree.fromstring(response)
            if root is None:
                raise HTTPException(status_code=404, detail="Target not found")
            return element_to_dict(root)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/targets/{target_id}")
def get_target(target_id: str):
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            response = gmp.get_target(target_id)
            root = etree.fromstring(response) 
            if root is None:
                raise HTTPException(status_code=404, detail="Target not found")
            return element_to_dict(root)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.put("/targets/{target_id}")
def update_target(target_id: str, request: TargetRequest):
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            gmp.modify_target(
                target_id=target_id,
                name=request.name,
                hosts=request.hosts,
                port_list_id=request.port_list_id
            )
            return {"message": f"Target {target_id} updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.delete("/targets/{target_id}")
def delete_target(target_id: str):
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            gmp.delete_target(target_id)
            return {"message": f"Target {target_id} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------- SCHEDULE ----------------------

@app.post("/schedules")
def create_schedule(request: ScheduleRequest):
    try:
        # Create iCalendar structure
        cal = Calendar()
        cal.add('prodid', '-//OpenVOC Scheduler//')
        cal.add('version', '2.0')

        event = Event()
        event.add('dtstamp', datetime.now(tz=pytz.UTC))

        dtstart = datetime.strptime(request.time, "%Y%m%dT%H%M%SZ").replace(tzinfo=pytz.UTC)
        event.add('dtstart', dtstart)

        # Build RRULE
        rrule_dict = {"FREQ": request.period.split('=')[1]}
        if request.until:
            until_dt = datetime.strptime(request.until, "%Y%m%dT%H%M%SZ").replace(tzinfo=pytz.UTC)
            rrule_dict["UNTIL"] = until_dt
        event.add('rrule', rrule_dict)

        cal.add_component(event)
        ical = cal.to_ical().decode("utf-8")

        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            response = gmp.create_schedule(
                name=request.name,
                icalendar=ical,
                timezone=request.timezone or "UTC"
            )
            root = etree.fromstring(response)
            if root is None:
                raise HTTPException(status_code=404, detail="Target not found")
            return element_to_dict(root)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/schedules")
def get_all_schedules():
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            response = gmp.get_schedules()
            root = etree.fromstring(response)
            if root is None:
                raise HTTPException(status_code=404, detail="Target not found")
            return element_to_dict(root)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/schedules/{schedule_id}")
def get_schedule(schedule_id: str):
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            response = gmp.get_schedule(schedule_id)
            root = etree.fromstring(response)
            if root is None:
                raise HTTPException(status_code=404, detail="Target not found")
            return element_to_dict(root)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.put("/schedules/{schedule_id}")
def update_schedule(schedule_id: str, request: ScheduleRequest):
    try:
        cal = Calendar()
        cal.add('prodid', '-//OpenVOC Scheduler//')
        cal.add('version', '2.0')

        event = Event()
        event.add('dtstamp', datetime.now(tz=pytz.UTC))

        dtstart = datetime.strptime(request.time, "%Y%m%dT%H%M%SZ").replace(tzinfo=pytz.UTC)
        event.add('dtstart', dtstart)

        rrule_dict = {"FREQ": request.period.split('=')[1]}
        if request.until:
            until_dt = datetime.strptime(request.until, "%Y%m%dT%H%M%SZ").replace(tzinfo=pytz.UTC)
            rrule_dict["UNTIL"] = until_dt
        event.add('rrule', rrule_dict)

        cal.add_component(event)
        ical = cal.to_ical().decode("utf-8")

        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            gmp.modify_schedule(
                schedule_id=schedule_id,
                name=request.name,
                icalendar=ical,
                timezone=request.timezone or "UTC"
            )
            return {"message": f"Schedule {schedule_id} updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.delete("/schedules/{schedule_id}")
def delete_schedule(schedule_id: str):
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            gmp.delete_schedule(schedule_id)
            return {"message": f"Schedule {schedule_id} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# ---------------------- TASK ----------------------

@app.post("/tasks")
def create_task(request: TaskRequest):
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            response = gmp.create_task(
                name=request.name,
                config_id=request.config_id,
                target_id=request.target_id,
                schedule_id=request.schedule_id,
                scanner_id=request.scanner_id
            )
            root = etree.fromstring(response)
            if root is None:
                raise HTTPException(status_code=404, detail="Target not found")
            return element_to_dict(root)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tasks")
def get_all_tasks():
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            response = gmp.get_tasks()
            root = etree.fromstring(response)
            if root is None:
                raise HTTPException(status_code=404, detail="Target not found")
            return element_to_dict(root)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/tasks/{task_id}")
def get_task(task_id: str):
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            response = gmp.get_task(task_id)
            root = etree.fromstring(response)
            if root is None:
                raise HTTPException(status_code=404, detail="Target not found")
            return element_to_dict(root)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.put("/tasks/{task_id}")
def update_task(task_id: str, request: TaskRequest):
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            gmp.modify_task(
                task_id=task_id,
                name=request.name,
                config_id=request.config_id,
                target_id=request.target_id,
                schedule_id=request.schedule_id,
                scanner_id=request.scanner_id
            )
            return {"message": f"Task {task_id} updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/tasks/{task_id}")
def delete_task(task_id: str):
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            gmp.delete_task(task_id)
            return {"message": f"Task {task_id} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/tasks/{task_id}/start")
def start_task(task_id: str):
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            gmp.start_task(task_id)
            return {"message": f"Task {task_id} started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
#------------------- results ----------------------------------

@app.get("/tasks/{task_id}/results")
def get_results_for_task(task_id: str):
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            response = gmp.get_results(task_id=task_id)
            root = etree.fromstring(response)
            if root is None:
                raise HTTPException(status_code=404, detail="Target not found")
            return element_to_dict(root)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/results/{result_id}")
def get_result_detail(result_id: str):
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            response = gmp.get_result(result_id)
            root = etree.fromstring(response)
            if root is None:
                raise HTTPException(status_code=404, detail="Target not found")
            return element_to_dict(root)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/reports/{report_id}")
def get_report(report_id: str, format: Optional[str] = "xml"):
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            report_format_id = {
                "pdf": "c402cc3e-b531-11e1-9163-406186ea4fc5",
                "xml": "a994b278-1f62-11e1-96ac-406186ea4fc5"
            }.get(format.lower(), "c402cc3e-b531-11e1-9163-406186ea4fc5")

            response = gmp.get_report(report_id=report_id, report_format_id=report_format_id, details=True)
            return {"report": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#----------------------- other ---------------------------------

@app.get("/port-lists")
def get_all_port_lists():
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            response = gmp.get_port_lists()
            root = etree.fromstring(response)
            port_lists = [
                {
                    "id": pl.get("id"),
                    "name": pl.findtext("name")
                }
                for pl in root.findall("port_list")
            ]
            return {"port_lists": port_lists}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/scan-configs")
def get_all_scan_configs():
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            response = gmp.get_scan_configs()
            root = etree.fromstring(response)
            configs = [
                {
                    "id": config.get("id"),
                    "name": config.findtext("name")
                }
                for config in root.findall("config")
            ]
            return {"scan_configs": configs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/scanners")
def get_all_scanners():
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            response = gmp.get_scanners()
            root = etree.fromstring(response)
            scanners = [
                {
                    "id": scanner.get("id"),
                    "name": scanner.findtext("name")
                }
                for scanner in root.findall("scanner")
            ]
            return {"scanners": scanners}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
     
@app.get("/debug")
def debug_connection():
    try:
        with connect_to_gvm() as gmp:
            gmp.authenticate(gvmUsername, gvmPassword)
            version_info = gmp.get_version()
            return {
                "host": GVM_HOST,
                "port": GVM_PORT,
                "user": gvmUsername,
                "version": version_info
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))