# EventBus Architecture - Requirements

## Overview
Transform the Claw Shield backend from a linear request-response architecture into an event-driven agentic runtime. The EventBus will serve as the communication spine, enabling autonomous agents to react to system events rather than being directly invoked by controllers.

## Problem Statement
Currently, the backend follows a traditional CRUD-style architecture where controllers directly call services and agents. This creates tight coupling, makes reasoning flows difficult to trace, and requires modifying existing code to add new agents or capabilities.

## Goals
1. Introduce an event-driven architecture that decouples components
2. Enable agents to operate autonomously by reacting to events
3. Create an audit trail for reasoning flows and decision-making
4. Establish foundation for future observability, tracing, and replay capabilities
5. Allow new agents to be added without modifying existing controllers

## Non-Goals
- Creating a full workflow engine or orchestration system
- Embedding business logic within the EventBus itself
- Replacing all synchronous operations with events immediately
- Building complex event sourcing or CQRS patterns

## User Stories

### US-1: Event-Driven Session Flow
**As a** backend developer  
**I want** session lifecycle events to trigger agent reactions automatically  
**So that** agents can process sessions without tight coupling to controllers

**Acceptance Criteria:**
- 1.1: When a session starts, a SESSION_STARTED event is emitted
- 1.2: Context agent automatically reacts to SESSION_STARTED without being directly called
- 1.3: Context agent emits CONTEXT_READY when context preparation completes
- 1.4: Strategy agent reacts to CONTEXT_READY and emits STRATEGY_READY
- 1.5: The event chain flows without any component knowing who runs next

### US-2: Centralized Event Contracts
**As a** backend developer  
**I want** all event names defined in a single constants file  
**So that** the system remains stable and events are discoverable

**Acceptance Criteria:**
- 2.1: All event names are defined in `src/constants/index.js`
- 2.2: Event names follow a consistent naming convention (UPPERCASE_SNAKE_CASE)
- 2.3: Events are categorized by domain (session, strategy, execution, policy)
- 2.4: No event strings are hardcoded outside the constants file
- 2.5: Event payload schemas are documented in constants

### US-3: Agent Registration System
**As a** backend developer  
**I want** agents to self-register their event listeners on startup  
**So that** the system automatically wires up the event graph

**Acceptance Criteria:**
- 3.1: Each agent exports a `register(eventBus)` function
- 3.2: Agents are imported and registered during application boot in `server.js`
- 3.3: If an agent is not imported, its listeners simply don't exist (no errors)
- 3.4: Registration order doesn't matter (agents are independent)
- 3.5: Agents can register multiple event listeners

### US-4: EventBus Core Infrastructure
**As a** backend developer  
**I want** a wrapped EventBus implementation in core infrastructure  
**So that** future capabilities can be added without refactoring agents

**Acceptance Criteria:**
- 4.1: EventBus is implemented in `src/core/eventBus.js`
- 4.2: EventBus wraps Node.js EventEmitter with additional capabilities
- 4.3: EventBus provides `emit(eventName, payload)` method
- 4.4: EventBus provides `on(eventName, handler)` method for registration
- 4.5: EventBus provides `once(eventName, handler)` for one-time listeners
- 4.6: EventBus logs all events for debugging (can be toggled)
- 4.7: EventBus validates event names against constants
- 4.8: EventBus provides error handling for failed listeners

### US-5: Controller Transformation
**As a** backend developer  
**I want** controllers to emit events instead of calling services directly  
**So that** the system becomes reactive and decoupled

**Acceptance Criteria:**
- 5.1: Session controller emits SESSION_STARTED instead of calling context agent
- 5.2: Controllers receive eventBus instance via dependency injection
- 5.3: Controllers remain thin (only HTTP → event translation)
- 5.4: Controllers don't wait for agent responses (fire-and-forget for async flows)
- 5.5: Controllers can still use services for synchronous operations (auth, CRUD)

### US-6: Agent Event Listeners
**As a** backend developer  
**I want** agents to listen for events and emit new events when done  
**So that** the reasoning pipeline flows naturally

**Acceptance Criteria:**
- 6.1: Context agent listens for SESSION_STARTED
- 6.2: Context agent emits CONTEXT_READY with prepared context
- 6.3: Strategy agent listens for CONTEXT_READY
- 6.4: Strategy agent emits STRATEGY_READY with proposed plan
- 6.5: Agents handle errors gracefully and emit ERROR events
- 6.6: Agents don't know about HTTP layers or controllers

### US-7: Event Logging and Observability
**As a** backend developer  
**I want** all events logged with timestamps and payloads  
**So that** I can trace reasoning flows and debug issues

**Acceptance Criteria:**
- 7.1: EventBus logs every emitted event with timestamp
- 7.2: Event logs include event name, payload summary, and source
- 7.3: Logging can be configured via environment variable (LOG_EVENTS=true)
- 7.4: Event logs are structured for future integration with logging systems
- 7.5: Sensitive data is redacted from event logs

### US-8: Test Agent for Validation
**As a** backend developer  
**I want** a minimal test agent that logs events  
**So that** I can verify the EventBus is working correctly

**Acceptance Criteria:**
- 8.1: Test agent listens for all SESSION_* events
- 8.2: Test agent logs received events to console
- 8.3: Test agent can be enabled/disabled via environment variable
- 8.4: Test agent demonstrates proper registration pattern
- 8.5: Test agent doesn't interfere with production agents

## Technical Constraints

### Architecture Constraints
- EventBus must be in `src/core/` (infrastructure layer)
- Event constants must be in `src/constants/index.js`
- Agents must remain in `src/agents/` directory
- Controllers must not directly import or call agents
- No circular dependencies between core, agents, and controllers

### Performance Constraints
- Event emission must be non-blocking for async flows
- Event listeners must not block the event loop
- Failed listeners must not crash the application
- Event logging must have minimal performance impact

### Compatibility Constraints
- Must work with existing Express.js setup
- Must integrate with existing MongoDB models
- Must not break existing auth system
- Must support both sync and async event handlers

## Event Flow Examples

### Example 1: Session Start Flow
```
HTTP POST /api/sessions/start
  ↓
SessionController.startSession()
  ↓
eventBus.emit('SESSION_STARTED', { sessionId, userId, preferences })
  ↓
ContextAgent listens → prepares context
  ↓
eventBus.emit('CONTEXT_READY', { sessionId, context })
  ↓
StrategyAgent listens → proposes plan
  ↓
eventBus.emit('STRATEGY_READY', { sessionId, plan })
  ↓
PolicyEngine listens → evaluates plan
  ↓
eventBus.emit('PLAN_APPROVED', { sessionId, plan })
  ↓
ExecutionLayer listens → executes plan
```

### Example 2: Error Handling Flow
```
eventBus.emit('SESSION_STARTED', { sessionId })
  ↓
ContextAgent fails during processing
  ↓
eventBus.emit('CONTEXT_ERROR', { sessionId, error })
  ↓
ErrorHandler listens → logs error, notifies user
  ↓
SessionController receives error via socket/callback
```

## Success Metrics
- Controllers no longer directly import agent modules
- New agents can be added by creating file + registering in server.js
- Event flow is traceable through logs
- System remains responsive under load
- Zero circular dependencies in dependency graph

## Dependencies
- Node.js EventEmitter (built-in)
- Existing logger infrastructure (`src/core/logger.js`)
- Existing constants structure (`src/constants/index.js`)

## Risks and Mitigations

### Risk 1: Event Ordering Issues
**Mitigation:** Use event names that imply sequence (STARTED → READY → APPROVED)

### Risk 2: Lost Events
**Mitigation:** Implement event logging and optional persistence for critical events

### Risk 3: Debugging Complexity
**Mitigation:** Comprehensive event logging with correlation IDs

### Risk 4: Performance Overhead
**Mitigation:** Make event logging optional, use async handlers where possible

## Future Enhancements (Out of Scope)
- Event replay for debugging
- Event persistence to database
- Event-driven webhooks
- Distributed event bus (Redis pub/sub)
- Event versioning and schema validation
- GraphQL subscriptions for real-time events
- Event-driven testing framework
