# LeetCode Backend System Architecture

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           LeetCode Backend System                               │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ProblemService │    │ SubmissionService│    │ EvaluationService│
│                 │    │                 │    │                 │
│  • CRUD Problems│    │ • Handle Submits│    │ • Execute Code  │
│  • Search &     │    │ • Queue Jobs    │    │ • Run Test Cases│
│    Filter       │    │ • Track Status  │    │ • Return Results│
│  • Markdown     │    │ • API Gateway   │    │ • Docker Contain│
│    Sanitization │    │ • Job Producer  │    │ • Resource Limit│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    MongoDB      │    │    MongoDB      │    │    Docker       │
│   (Problems)    │    │  (Submissions)  │    │   Containers    │
│                 │    │                 │    │                 │
│ • Problem Data  │    │ • Submission    │    │ • Python        │
│ • Test Cases    │    │   History       │    │ • C++           │
│ • Metadata      │    │ • Status Track  │    │ • Isolated Env  │
│ • Editorial     │    │ • Results       │    │ • Security      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │      Redis      │
                       │   (Message      │
                       │    Queue)       │
                       │                 │
                       │ • BullMQ Jobs   │
                       │ • Async Process │
                       │ • Retry Logic   │
                       │ • Job Scheduling│
                       └─────────────────┘
```

## Data Flow Diagram

```
User Request Flow:

1. Browse Problems:
   User → ProblemService → MongoDB → Response

2. Submit Solution:
   User → SubmissionService → ProblemService (validate) → MongoDB
                               ↓
                           Redis Queue → EvaluationService → Docker → Results
                               ↓
                           Update Submission Status

3. Check Results:
   User → SubmissionService → MongoDB → Response
```

## Service Communication Flow

```
┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
│    User     │    │  SubmissionService│    │ EvaluationService│
│             │    │                  │    │                 │
└─────┬───────┘    └─────────┬────────┘    └─────────┬───────┘
      │                      │                       │
      │ 1. Submit Code       │                       │
      ├─────────────────────►│                       │
      │                      │                       │
      │ 2. Validate Problem  │                       │
      │                      ├──────────────────────►│
      │                      │                       │
      │ 3. Queue Job         │                       │
      │                      ├──────────────────────►│
      │                      │                       │
      │ 4. Process Job       │                       │
      │                      │◄──────────────────────┤
      │                      │                       │
      │ 5. Update Status     │                       │
      │                      ├──────────────────────►│
      │                      │                       │
      │ 6. Get Results       │                       │
      ├─────────────────────►│                       │
      │                      │                       │
      │ 7. Return Results    │                       │
      │◄─────────────────────┤                       │
```

## Technology Stack Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Technology Stack                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend Layer (Not Included)                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  User Interface (Web/Mobile App)                      ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  API Gateway Layer                                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Express.js + TypeScript REST APIs                    ││
│  │  • Request Validation (Zod)                           ││
│  │  • Error Handling                                     ││
│  │  • CORS & Security                                    ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  Microservices Layer                                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Problem     │ │ Submission  │ │ Evaluation  │           │
│  │ Service     │ │ Service     │ │ Service     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  Message Queue Layer                                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Redis + BullMQ                                        ││
│  │  • Asynchronous Processing                             ││
│  │  • Job Retry Logic                                     ││
│  │  • Queue Management                                    ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  MongoDB                                                ││
│  │  • Problem Data                                        ││
│  │  • Submission History                                  ││
│  │  • User Data                                           ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  Execution Layer                                           │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Docker Containers                                     ││
│  │  • Python Runtime                                      ││
│  │  • C++ Compiler                                        ││
│  │  • Security Isolation                                  ││
│  │  • Resource Limits                                     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Security & Isolation Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   User Code     │    │   System Code   │                │
│  │                 │    │                 │                │
│  │  • Untrusted    │    │  • Trusted      │                │
│  │  • Sanitized    │    │  • Validated    │                │
│  │  • Isolated     │    │  • Secure       │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                       │                        │
│           ▼                       ▼                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │            Docker Container Isolation                  ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │  • Network: None (No Internet Access)              │││
│  │  │  • Memory: 1GB Limit                               │││
│  │  │  • CPU: 50% Quota                                  │││
│  │  │  • Processes: 100 Limit                            │││
│  │  │  • Security: no-new-privileges                     │││
│  │  │  • File System: Read-Only                          │││
│  │  └─────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Input Validation & Sanitization           ││
│  │  • Zod Schema Validation                               ││
│  │  • Markdown Sanitization                               ││
│  │  • SQL Injection Prevention                            ││
│  │  • XSS Protection                                      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment View                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Load        │  │ Load        │  │ Load        │          │
│  │ Balancer    │  │ Balancer    │  │ Balancer    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│        │                │                │                 │
│        ▼                ▼                ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Problem     │  │ Submission  │  │ Evaluation  │          │
│  │ Service     │  │ Service     │  │ Service     │          │
│  │ (Multiple   │  │ (Multiple   │  │ (Multiple   │          │
│  │  Instances) │  │  Instances) │  │  Instances) │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│        │                │                │                 │
│        ▼                ▼                ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ MongoDB     │  │ Redis       │  │ Docker      │          │
│  │ Cluster     │  │ Cluster     │  │ Registry    │          │
│  │ (Replica    │  │ (Sentinel   │  │ (Container  │          │
│  │  Set)       │  │  Mode)      │  │  Images)    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

This architecture ensures:

- **High Availability**: Multiple instances of each service
- **Scalability**: Independent scaling of services
- **Fault Tolerance**: Load balancers and clustering
- **Security**: Isolated execution environments
- **Performance**: Optimized data flow and caching
