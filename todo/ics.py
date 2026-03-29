from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from icalendar import Calendar, Event

from todo.models import Importance, TodoItem, TodoList

DEFAULT_DURATION_MINUTES = 30


def _sanitize_filename(name: str) -> str:
    safe = "".join(c for c in name if c.isalnum() or c in " -_").strip()
    return safe or "export"


def build_event(item: TodoItem, todo_list: TodoList) -> Event:
    event = Event()
    event.add("uid", f"{item.pk}-{uuid.uuid4()}@ef-todo")
    event.add("dtstamp", datetime.now(UTC))
    event.add("summary", item.title)
    event.add("status", "CONFIRMED")

    duration = timedelta(minutes=item.duration_minutes or DEFAULT_DURATION_MINUTES)
    event.add("dtstart", item.due_date)
    event.add("dtend", item.due_date + duration)

    if item.importance != Importance.NONE:
        event.add("priority", item.importance)

    tag_names = [tag.name for tag in item.tags.all()]
    if tag_names:
        event.add("categories", tag_names)

    description_parts: list[str] = []
    if item.description:
        description_parts.append(item.description)
    if tag_names:
        description_parts.append(f"Tags: {', '.join(tag_names)}")
    if item.importance != Importance.NONE:
        importance_label = Importance(item.importance).label
        description_parts.append(f"Importance: {importance_label}")
    description_parts.append(f"List: {todo_list.name}")
    event.add("description", "\n".join(description_parts))

    return event


def build_calendar(todo_list: TodoList, items: list[TodoItem]) -> Calendar:
    cal = Calendar()
    cal.add("prodid", "-//ef-todo//ef-todo//EN")
    cal.add("version", "2.0")
    cal.add("x-wr-calname", todo_list.name)
    if todo_list.description:
        cal.add("x-wr-caldesc", todo_list.description)

    for item in items:
        cal.add_component(build_event(item, todo_list))

    return cal
