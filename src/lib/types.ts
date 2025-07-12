/**
 * Represents a life event.
 */
export type Event = {
    /** The name of the event. */
    name: string;

    /** The location where the event will take place. */
    location: string;
    
    /** The start date and time of the event in ISO 8601 format. */
    startDate: string; // Should be in date-time format
    
    /** The end date and time of the event in ISO 8601 format. */
    endDate: string; // Should be in date-time format
    
    /** A color associated with the event, typically used for display purposes. */
    color: string;
    
    /** A URL for more information about the event, must use HTTPS. */
    url?: string; // Optional, as it's not in the required properties
};
