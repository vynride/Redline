"""Shared enums used across schemas, the engine, and scenario data."""
from __future__ import annotations

import enum


class Archetype(str, enum.Enum):
    production_outage = "production_outage"
    payment_failure = "payment_failure"
    security_alert = "security_alert"
    support_escalation = "support_escalation"
    broken_release = "broken_release"
    latency_spike = "latency_spike"


class Role(str, enum.Enum):
    on_call_engineer = "on_call_engineer"
    incident_commander = "incident_commander"
    support_lead = "support_lead"
    customer_support_agent = "customer_support_agent"
    ops_responder = "ops_responder"


class Difficulty(str, enum.Enum):
    warmup = "warmup"
    production_like = "production_like"
    redline = "redline"


class Emotion(str, enum.Enum):
    neutral = "neutral"
    calm = "calm"
    confused = "confused"
    frustrated = "frustrated"
    angry = "angry"
    urgent = "urgent"
