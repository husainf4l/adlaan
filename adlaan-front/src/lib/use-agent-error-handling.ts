import { useState, useCallback, useRef } from 'react';
import { AgentError, AgentTimeoutError } from './ai-agent-service';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: string;
  agentType?: string;
  taskId?: string;
  metadata?: Record<string, any>;
}

export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  retryCount: number;
  lastRetryAt: string | null;
}

export interface LoadingState {
  isLoading: boolean;
  operation: string | null;
  startedAt: string | null;
}

const LOG_STORAGE_KEY = 'adlaan_agent_logs';
const MAX_LOGS = 1000;

export const useAgentErrorHandling = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorId: null,
    retryCount: 0,
    lastRetryAt: null,
  });

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    operation: null,
    startedAt: null,
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(LOG_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const loggerRef = useRef({
    log: (level: LogEntry['level'], message: string, context?: string, metadata?: Record<string, any>) => {
      const entry: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        level,
        message,
        context,
        metadata,
      };

      setLogs(prevLogs => {
        const newLogs = [entry, ...prevLogs].slice(0, MAX_LOGS);
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(newLogs));
          } catch (error) {
            console.warn('Failed to save logs to localStorage:', error);
          }
        }

        return newLogs;
      });

      // Also log to console based on level
      switch (level) {
        case 'error':
          console.error(`[Adlaan Agent] ${context ? `[${context}] ` : ''}${message}`, metadata);
          break;
        case 'warn':
          console.warn(`[Adlaan Agent] ${context ? `[${context}] ` : ''}${message}`, metadata);
          break;
        case 'debug':
          console.debug(`[Adlaan Agent] ${context ? `[${context}] ` : ''}${message}`, metadata);
          break;
        default:
          console.log(`[Adlaan Agent] ${context ? `[${context}] ` : ''}${message}`, metadata);
      }
    }
  });

  const logger = loggerRef.current;

  const setError = useCallback((error: Error, context?: string, metadata?: Record<string, any>) => {
    const errorId = Math.random().toString(36).substr(2, 9);
    
    setErrorState(prev => ({
      hasError: true,
      error,
      errorId,
      retryCount: prev.retryCount,
      lastRetryAt: prev.lastRetryAt,
    }));

    // Enhanced error logging with classification
    const errorType = error instanceof AgentError ? 'AgentError' : 
                     error instanceof AgentTimeoutError ? 'TimeoutError' : 
                     'UnknownError';

    logger.log('error', error.message, context, {
      errorType,
      errorId,
      stack: error.stack,
      ...(error instanceof AgentError && {
        agentType: error.agentType,
        taskId: error.taskId,
        statusCode: error.statusCode,
      }),
      ...metadata,
    });
  }, [logger]);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
      lastRetryAt: null,
    });
  }, []);

  const incrementRetry = useCallback(() => {
    setErrorState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      lastRetryAt: new Date().toISOString(),
    }));

    logger.log('info', `Retry attempt ${errorState.retryCount + 1}`, 'Error Handling');
  }, [logger, errorState.retryCount]);

  const setLoading = useCallback((loading: boolean, operation?: string) => {
    setLoadingState({
      isLoading: loading,
      operation: operation || null,
      startedAt: loading ? new Date().toISOString() : null,
    });

    if (loading) {
      logger.log('info', `Started operation: ${operation || 'Unknown'}`, 'Loading');
    } else {
      logger.log('info', `Completed operation: ${loadingState.operation || 'Unknown'}`, 'Loading');
    }
  }, [logger, loadingState.operation]);

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      operationName: string;
      context?: string;
      maxRetries?: number;
      retryDelay?: number;
      onRetry?: (attempt: number) => void;
      onSuccess?: (result: T) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<T | null> => {
    const {
      operationName,
      context = 'Agent Operation',
      maxRetries = 3,
      retryDelay = 1000,
      onRetry,
      onSuccess,
      onError,
    } = options;

    setLoading(true, operationName);
    clearError();

    let lastError: Error;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        logger.log('info', `Executing ${operationName} (attempt ${attempt + 1}/${maxRetries + 1})`, context);
        
        const result = await operation();
        
        setLoading(false);
        logger.log('info', `Successfully completed ${operationName}`, context);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        logger.log('warn', `${operationName} failed on attempt ${attempt + 1}: ${lastError.message}`, context, {
          attempt: attempt + 1,
          maxRetries: maxRetries + 1,
        });

        // Don't retry on certain types of errors
        if (error instanceof AgentError && error.statusCode && error.statusCode < 500) {
          break;
        }

        if (attempt < maxRetries) {
          if (onRetry) {
            onRetry(attempt + 1);
          }
          
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          attempt++;
        } else {
          break;
        }
      }
    }

    setLoading(false);
    setError(lastError!, context, { operationName, totalAttempts: attempt + 1 });
    
    if (onError) {
      onError(lastError!);
    }

    return null;
  }, [setLoading, clearError, setError, logger]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOG_STORAGE_KEY);
    }
    logger.log('info', 'Logs cleared', 'Log Management');
  }, [logger]);

  const exportLogs = useCallback(() => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `adlaan-agent-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    logger.log('info', 'Logs exported', 'Log Management');
  }, [logs, logger]);

  const getErrorSeverity = useCallback((error: Error): 'low' | 'medium' | 'high' | 'critical' => {
    if (error instanceof AgentTimeoutError) return 'medium';
    if (error instanceof AgentError) {
      if (error.statusCode) {
        if (error.statusCode >= 500) return 'high';
        if (error.statusCode >= 400) return 'medium';
      }
      return 'medium';
    }
    return 'high';
  }, []);

  const getRecommendedAction = useCallback((error: Error): string => {
    if (error instanceof AgentTimeoutError) {
      return 'The request timed out. Try again or check your connection.';
    }
    
    if (error instanceof AgentError) {
      if (error.statusCode === 401) {
        return 'Authentication failed. Please log in again.';
      }
      if (error.statusCode === 403) {
        return 'You do not have permission to perform this action.';
      }
      if (error.statusCode === 429) {
        return 'Rate limit exceeded. Please wait before trying again.';
      }
      if (error.statusCode && error.statusCode >= 500) {
        return 'Server error occurred. The issue has been logged and will be investigated.';
      }
    }
    
    return 'An unexpected error occurred. Please try again.';
  }, []);

  return {
    // State
    errorState,
    loadingState,
    logs,
    
    // Error handling
    setError,
    clearError,
    incrementRetry,
    
    // Loading state
    setLoading,
    
    // Execution wrapper
    executeWithErrorHandling,
    
    // Logging
    logger,
    clearLogs,
    exportLogs,
    
    // Error analysis
    getErrorSeverity,
    getRecommendedAction,
    
    // Computed values
    isRetryable: errorState.hasError && errorState.retryCount < 3 && 
                 !(errorState.error instanceof AgentError && 
                   errorState.error.statusCode && 
                   errorState.error.statusCode < 500),
  };
};